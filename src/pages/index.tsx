import { useState } from "react";
import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import {getStory} from '../../lib/story'
import parse from 'html-react-parser';
import TypeIt from "typeit-react";

export async function getStaticProps() {
  const {forkData, pathData} = await getStory()

  return {
    props: {
      forkData,
      pathData
    },
  };
}

export default function Home({forkData, pathData}) {
  const [currentPathId, setCurrentPathId] = useState("root");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const currentPath = pathData.find((path) => path.id === currentPathId) || pathData[0]

  const possibleForks = currentPath.forks || []
  const currentForks = forkData ? forkData.filter((fork) => possibleForks.includes(fork.id)) : []

  const takePath = (nextPath) => {
    setCurrentPathId(nextPath);
    setIsTypingComplete(false)
  }

  const pollInstanceCompletion = (instance) => {
    const interval = setInterval(() => {
      if (instance.is("completed")) {
        setIsTypingComplete(true)
        clearInterval(interval);
      }
    }, 500)
    
    return instance;
  }

  return (
    <>
      <Head>
        <title>my little story</title>
      </Head>

      <main className={styles.storyWrapper}>
        <div key={currentPathId} >
          <TypeIt 
            options={{
              strings: currentPath.linesHtml,
              waitUntilVisible: true
            }} 
            getAfterInit={(instance) => pollInstanceCompletion(instance)}
          />
        </div>
        <div className={styles.forkWrapper}>
          {isTypingComplete && currentForks.map((fork) => 
            <button key={fork.id} onClick={() => takePath(fork.next)}>{parse(fork.contentHtml)}</button>
          )}
        </div>
      </main>
    </>
  )
}
