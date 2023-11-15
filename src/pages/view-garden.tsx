import {getStoryTree} from '../../lib/story'

export async function getStaticProps() {
  const storyTree = await getStoryTree()

  return {
    props: {
      storyTree
    },
  };
}

export default function ViewGarden({storyTree}) {

  return (
    <div>
      {JSON.stringify(storyTree)}
    </div>
  )
}
