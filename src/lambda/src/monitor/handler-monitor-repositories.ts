import AWS from 'aws-sdk';

import { GithubClient } from './github-client';
import { JobScheduler } from './JobScheduler';
import { OrganizationManager } from './organization-manager';
import { RepositoryExplorer } from './repository-explorer';

export class MonitorRepositoriesHandlerProps {
  queueUrl: string;
  organizationName: string;
}

export class MonitorRepositoriesHandler {
  constructor(private props: MonitorRepositoriesHandlerProps) {}
  public handler = async () => {
    const organizationInfo = await new OrganizationManager().get(this.props.organizationName);
    const githubClient = new GithubClient(organizationInfo.githubToken);
    const repositoryExplorer = new RepositoryExplorer(githubClient);
    const jobScheduler = new JobScheduler(this.props.queueUrl, new AWS.SQS());
    const repos = await repositoryExplorer.listRepositories(organizationName);
    await jobScheduler?.queueRepositoryDiscoveryJobs(repos);
  };
}

const queueUrl = process.env.SQS_QUEUE_URL;
if (!queueUrl) {
  throw new Error(`process.env.SQS_QUEUE_URL is not provided`);
}

const organizationName = process.env.ORGANIZATION_NAME;
if (!organizationName) {
  throw new Error(`process.env.ORGANIZATION_NAME is not provided`);
}

const factoryCodeBuildProjectName = process.env.FACTORY_CODEBUILD_PROJECT_NAME;
if (!factoryCodeBuildProjectName) {
  throw new Error(`process.env.FACTORY_CODEBUILD_PROJECT_NAME is not provided`);
}

export const handler = new MonitorRepositoriesHandler({
  queueUrl,
  organizationName,
}).handler;
