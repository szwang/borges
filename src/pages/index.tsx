import {useState} from "react";
import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import {getStory} from '../../lib/story'
import parse from 'html-react-parser';
import Content from "../../components/Content";
import TypeIt from "typeit-react";


const inter = Inter({ subsets: ['latin'] })

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
  const currentPath = pathData.find((path) => path.id === currentPathId) || pathData[0]

  const possibleForks = currentPath.forks || []
  const currentForks = forkData ? forkData.filter((fork) => possibleForks.includes(fork.id)) : []

  const takePath = (nextPath) => {
    setCurrentPathId(nextPath)
  }

  return (
    <>
      <Head>
        <title>my little story</title>
      </Head>

      <main className={styles.storyWrapper}>
        <div key={currentPathId} >
          <Content strings={currentPath.content.split("\n")}/>
        </div>
        <div className={styles.forkWrapper}>
          {currentForks.map((fork) => 
            <button key={fork.id} onClick={() => takePath(fork.next)}>{parse(fork.contentHtml)}</button>
          )}
        </div>
      </main>
    </>
  )
}
