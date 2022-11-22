import * as cdk from 'aws-cdk-lib';

export default class FactoryProperties implements cdk.StackProps {
  readonly pipelineTemplateRepositoryName: string;
  readonly pipelineTemplateGithubOwner: string;
  readonly pipelineTemplateBranchName: string;
  readonly apiDomainName?: string;
  readonly apiDomainCertificateArn?: string;
  readonly triggerCodeS3Bucket: string;
  readonly triggerCodeS3Key: string;
  readonly tags?: { [key: string]: string };
  readonly env?: cdk.Environment;
  readonly existingBucketName?: string;
  readonly organizationName: string;
  readonly repositorySelector: string;
  readonly lambdaCodeEntryPoint: string;
  readonly githubToken: string;
}