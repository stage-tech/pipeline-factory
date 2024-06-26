import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AWSDevToolsClient } from '../../src/clients/aws-dev-tools-client';
import { GithubClient } from '../../src/clients/github-client';
import { ChannelType } from '../../src/models';
import { NotificationTargetsManager } from '../../src/notifications/notification-targets-manager';

describe('Notification Targets Manager', () => {
  const awsClientMock = mock(AWSDevToolsClient);
  const gitHubClientMock = mock(GithubClient);

  it('fetches setting from github', async () => {
    when(gitHubClientMock.getRepository(anything(), anything())).thenResolve({
      branches: [],
      defaultBranch: 'dev',
      name: 'myRepo',
      owner: 'myOrg',
      repositoryId: 'myId',
      settings: { monitoredBranches: ['new1', 'new2', 'existinG2', 'exisTing1'] },
      topics: ['topic1'],
    });
    const targetsManager = new NotificationTargetsManager(instance(awsClientMock), instance(gitHubClientMock));
    const payload = await targetsManager.getNotificationTargets(
      {
        branch: 'some_branch',
        owner: 'some_owner',
        repository: 'some_repository',
      },
      'FAILED',
    );
    verify(gitHubClientMock.getRepository('some_owner', 'some_repository')).once();
  });

  it('resolve targets on single and multiple branches', async () => {
    when(gitHubClientMock.getRepository(anything(), anything())).thenResolve({
      branches: [],
      defaultBranch: 'dev',
      name: 'myRepo',
      owner: 'myOrg',
      repositoryId: 'myId',
      settings: {
        notifications: [
          {
            branches: ['master'],
            event: 'FAILED',
            channelType: ChannelType.SLACK,
            channelId: 'master-problems',
          },
          {
            branches: ['master'],
            event: 'FAILED',
            channelType: ChannelType.SLACK,
            channelId: 'master-problems',
          },
          {
            branches: ['feature'],
            event: 'FAILED',
            channelType: ChannelType.SLACK,
            channelId: 'feature-problems',
          },
          {
            branches: ['feature', 'master'],
            event: 'FAILED',
            channelType: ChannelType.SLACK,
            channelId: 'global-problems',
          },
          {
            branches: ['master'],
            event: 'SUCCEEDED',
            channelType: ChannelType.SLACK,
            channelId: 'master-success',
          },
          {
            branches: ['feature'],
            event: 'FAILED',
            channelType: ChannelType.SLACK,
            channelId: 'feature-problems',
          },
        ],
      },
      topics: [],
    });
    const targetsManager = new NotificationTargetsManager(instance(awsClientMock), instance(gitHubClientMock));
    const targets = await targetsManager.getNotificationTargets(
      {
        branch: 'master',
        owner: 'some_owner',
        repository: 'some_repository',
      },
      'FAILED',
    );

    expect(targets).toContainEqual({
      channelType: ChannelType.SLACK,
      channelId: 'master-problems',
    });

    expect(targets).toContainEqual({
      channelType: ChannelType.SLACK,
      channelId: 'global-problems',
    });
  });

  it('return only distinct targets', async () => {
    when(gitHubClientMock.getRepository(anything(), anything())).thenResolve({
      branches: [],
      defaultBranch: 'dev',
      name: 'myRepo',
      owner: 'myOrg',
      repositoryId: 'myId',
      settings: {
        notifications: [
          {
            branches: ['master'],
            event: 'FAILED',
            channelType: ChannelType.SLACK,
            channelId: 'master-problems',
          },
          {
            branches: ['master', 'feature'],
            event: 'FAILED',
            channelType: ChannelType.SLACK,
            channelId: 'master-problems',
          },
        ],
      },
      topics: [],
    });
    const targetsManager = new NotificationTargetsManager(instance(awsClientMock), instance(gitHubClientMock));
    const targets = await targetsManager.getNotificationTargets(
      {
        branch: 'master',
        owner: 'some_owner',
        repository: 'some_repository',
      },
      'FAILED',
    );

    expect(targets).toHaveLength(1);
    expect(targets).toContainEqual({
      channelType: ChannelType.SLACK,
      channelId: 'master-problems',
    });
  });

  it('handles no targets gracefully', async () => {
    when(gitHubClientMock.getRepository(anything(), anything())).thenResolve({
      branches: [],
      defaultBranch: 'dev',
      name: 'myRepo',
      owner: 'myOrg',
      repositoryId: 'myId',
      topics: [],
    });
    const targetsManager = new NotificationTargetsManager(instance(awsClientMock), instance(gitHubClientMock));
    const targets = await targetsManager.getNotificationTargets(
      {
        branch: 'master',
        owner: 'some_owner',
        repository: 'some_repository',
      },
      'FAILED',
    );

    expect(targets).toHaveLength(0);
  });
});
