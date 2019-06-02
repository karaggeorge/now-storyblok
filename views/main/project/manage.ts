import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import StoryblokClient from '../../../utils/storyblok-client';

const ManageProject = async (options: RouteOptions) => {
  const {utils, zeitClient, payload: {projectId, team}} = options;
  const {token, user: {userId}} = utils.store;
  const {space: {id, accountId}, hook = {}} = utils.projectStore;

  if (utils.store.user.userId !== accountId) {
    return htm`
      <Notice type="error">This project is already connected to a space under a different Storyblok account</Notice>
    `;
  }

  const {aliasId, path = ''} = hook;
  const client = new StoryblokClient(token);

  const space = await client.getSpace(id);
  const summary = await client.getSummary(space);
  const apiHits = await client.getApiHitsThisMonth(space.id);

  const {aliases} = await zeitClient.fetchAndThrow(`/v2/now/aliases?projectId=${projectId}${team ? `&teamId=${team.id}` : ''}`, {method: 'GET'}) as any;
  const alias = aliasId || (aliases.length && aliases[0].uid);
  const {story_published_hook: currentHook} = space;

  return htm`
    <P>This project is connected to the following space:</P>
    <Fieldset>
      <FsContent>
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
          <FsTitle>${space.name}</FsTitle>
          <Box display="flex" alignItems="center">
            <B>${apiHits}</B>
            <Box width="3px"/>
            ${`API hit${apiHits === 1 ? '' : 's'} this month`}
            <Box width="10px"/>
            <Link href=${`https://app.storyblok.com/#!/me/spaces/${space.id}/edit`} target="_blank"><Button small secondary>Configure</Button></Link>
          </Box>
        </Box>
        ${
          summary.length > 0 ? htm`
            <P>
              Contains
              ${
                summary.map((item, index) => {
                  const isLast = index === summary.length - 1;
                  const isPriorToLast = index === summary.length - 2;

                  return htm`
                    <Link href=${item.link} target="_blank">${item.text}</Link>
                    ${isLast ? '' : (isPriorToLast ? ' and ' : ',')}
                  `;
                })
              }
            </P>
          ` : ''
        }
        <Box maxWidth="min-content" maxHeight="min-content" borderRadius="5px" overflow="hidden">
          <Img src=${`https://now-storyblok.now.sh/chart.png?token=${token}&userId=${userId}&space=${space.id}`} width="420px"/>
        </Box>
      </FsContent>
      <FsFooter>
          <Box display="flex" justifyContent="flex-end" width="100%">
            <Link href=${`https://app.storyblok.com/#!/me/spaces/${id}/dashboard`} target="_blank"><Button small secondary>Dashboard</Button></Link>
            <Box width="10px"/>
            <Button small warning action=${`disconnect-space/${utils.projectId}`}>Disconnect</Button>
          </Box>
      </FsFooter>
    </Fieldset>
    <Fieldset>
      <FsContent>
        <FsTitle>Add a webhook</FsTitle>
        <FsSubtitle>Get notified when a story is published or unpublished</FsSubtitle>
        <Box fontSize="13px">
          <P>
            In order to serve to most up-to-date content, you can create an endpoint that will flush the Storyblok cache.
            <BR/>
            You can do that by calling <Link href="https://github.com/storyblok/storyblok-js-client#method-storyblokflushcache" target="_blank">this method</Link> on the Storyblok client.
            <BR/>
            <BR/>
            Once you've created the endpoint you can configure the webhook below:
            <BR/>
            <BR/>
          </P>
        </Box>
        ${
          aliases.length ? htm`
            <Box display="flex" width="100%" alignItems="center">
              <Select name="alias" value=${alias}>
                ${
                  aliases.map((alias: any) => htm`
                    <Option value=${alias.uid} caption=${alias.alias}/>
                  `)
                }
              </Select>
              <Box flex="1" marginLeft="10px" display="flex">
                <Input name="path" placeholder="/path/to/route" value=${path}/>
              </Box>
            </Box>
          ` : htm`
            <Notice type="error">You need have at least one alias to configure the webhook</Notice>
          `
        }
      </FsContent>
      ${
        aliases.length ? htm`
          <FsFooter>
            <Box paddingLeft="5px" paddingRight="5px" display="flex" width="100%" justifyContent="space-between" alignItems="center">
              <P>${currentHook ? htm`NOTE: This will overwrite the current webhook: <Link href=${currentHook} target="_blank">${currentHook}</Link>` : ''}</P>
              <Button action="set-webhook">${currentHook ? 'Update' : 'Add'} webhook</Button>
            </Box>
          </FsFooter>
        ` : ''
      }
    </Fieldset>
  `;
};

export default ManageProject;
