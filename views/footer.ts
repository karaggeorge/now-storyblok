import {htm} from '@zeit/integration-utils';

const footer = htm`
  <Box marginTop="40px" display="flex" justifyContent="space-between" alignItems="center">
    <Box>
      <P>Built with ❤️ by <Link href="https://github.com/karaggeorge" target="_blank">George Karagkiaouris</Link> for the ZEIT Hackathon</P>
    </Box>
    <Box>
      <P>
        <Link href="https://github.com/karaggeorge/now-storyblok/issues/new" target="_blank">Found a bug?</Login>
        |
        <Link href="https://github.com/karaggeorge/now-storyblok" target="_blank">View source</Login>
      </P>
    </Box>
  </Box>
`;

export default footer;
