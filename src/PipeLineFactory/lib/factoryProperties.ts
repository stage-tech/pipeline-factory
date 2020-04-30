import * as cdk from "@aws-cdk/core";

export default class FactoryProperties implements cdk.StackProps {
  readonly githubRepositoryName: string;
  
  readonly githubRepositoryOwner: string;
  
  readonly githubRepositoryBranch: string;
  
  readonly projectName: string;
  
  readonly tags?: {[key: string]: string; };
  
  readonly env?: cdk.Environment;
  
}