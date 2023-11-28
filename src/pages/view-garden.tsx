import { useState } from 'react';
import {getStoryTree} from '../../lib/story'
import styles from '../styles/Garden.module.css'

export async function getStaticProps() {
  const {storyTree, forksByKey, pathsByKey} = await getStoryTree()

  return {
    props: {
      storyTree,
      forksByKey,
      pathsByKey
    },
  };
}

const PathCard = ({data, forksByKey, pathsByKey, setCurrentNode}) => {
  const revealData = (pathKey, e) => {
    e.stopPropagation();
    const data = pathsByKey[pathKey]
    setCurrentNode(data)
  }
  return (
    <>
     {data.map((item, i) => (
      <ul key={i}>
        <li>
          <div className={styles.card} onClick={(e) => revealData(item.id, e)}>
            {item.id}
            {item.children?.length && <PathCard setCurrentNode={setCurrentNode} data={item.children} pathsByKey={pathsByKey} forksByKey={forksByKey} />}
          </div>
        </li>
      </ul>
     ))}
    </>
  )
}

const TextView = ({html}) => {
  return (
    <div className={styles.textView}>
      <div dangerouslySetInnerHTML={{__html: html}}/>
    </div>
  )
}

export default function ViewGarden({storyTree, forksByKey, pathsByKey}) {
  const [currentNode, setCurrentNode] = useState(pathsByKey["root"]);

  return (
    <div>
      <h1>Story tree</h1> 
    <div className={styles.gardenContainer}>
      <PathCard setCurrentNode={setCurrentNode} data={storyTree} forksByKey={forksByKey} pathsByKey={pathsByKey}/>
      <TextView html={currentNode.contentHtml}/>
    </div>
    </div>
  )
}
