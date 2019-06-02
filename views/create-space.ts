import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';
import applyMainLayout from './main/layout';
import StoryblockClient from '../utils/storyblok-client';


const CreateSpaceView = async (options: RouteOptions) => {
  const {utils} = options;
  const {mode} = utils.params;
  const {token} = utils.store;
  const {error} = utils.context;

  const name = utils.get('name') || '';
  const client = new StoryblockClient(token);

  const spaces = await client.getSpaces();
  const spaceId = utils.get('spaceId') || (spaces.length && spaces[0].id);

  return applyMainLayout(options, htm`
    <Fieldset>
      <FsContent>
        <FsTitle>Create a new space</FsTitle>
        <Box display="flex" flexDirection="column" marginTop="10px">
          <Input value=${name} name="name" label="Name"/>
          ${
            mode === 'duplicate' && spaces.length ? htm`
              <Box height="10px"/>
              <Select name="spaceId" value=${spaceId} placeholder="Select aaa" label="Choose the space for the duplication">
                ${
                  spaces.map((space: any) => htm`
                    <Option value=${space.id} caption=${space.name}/>
                  `)
                }
              </Select>
            ` : ''
          }
        </Box>
      </FsContent>
      <FsFooter>
        <Box display="flex" justifyContent="space-between" width="100%">
          ${
            mode === 'new' && spaces.length ? htm`
              <Button small highlight action="view/create-space/duplicate">Duplicate Existing Space</Button>
            ` : htm`<Box/>`
          }
          <Button small action=${`create-space/${mode}`}>Create Space</Button>
        </Box>
      </FsFooter>
      ${ error ? htm`<Notice type="error">${error}</Notice>` : '' }
    </Fieldset>
  `);
}

export default CreateSpaceView;
