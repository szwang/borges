import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import {keyBy} from 'lodash'


export const forksDir = path.join(process.cwd(), 'garden/forks');
export const pathsDir = path.join(process.cwd(), 'garden/paths');

export async function getStoryTree() {
  const {forkData, pathData} = await getStory();
  // set each array by key 

  const forksByKey = keyBy(forkData, "id");
  const pathsByKey = keyBy(pathData, "id");

  const storyTree = generateTree(pathsByKey, forksByKey, "root", {
    ...pathsByKey["root"],
    forks: [],
    children: []
  })

  console.log(storyTree)

  return {
    storyTree
  }
}

export function generateTree(pathsByKey, forksByKey, currentPathId, tree) {
  console.log("AGAIN")
  console.log(currentPathId, tree)
  pathsByKey[currentPathId].forks.forEach((fork) => {
    tree.forks.push(forksByKey[fork])
    if (forksByKey[fork].next) {
      console.log("NEXT")
      tree.children.push(pathsByKey[forksByKey[fork].next])
      generateTree(pathsByKey, forksByKey, forksByKey[fork].next, tree)
    }
  })

  return tree;
}

export async function getStory() {
  const forkNames = fs.readdirSync(forksDir);
  const pathNames = fs.readdirSync(pathsDir);

  const forkData = await Promise.all(
    forkNames.map(async (fileName) => retrieveValues(fileName, forksDir))
  )
  const pathData = await Promise.all(
    pathNames.map(async (fileName) => retrieveValues(fileName, pathsDir))
  )

  const forksByKey = keyBy(forkData, "id");
  const pathsByKey = keyBy(pathData, "id");
  
  return {
    forkData,
    pathData,
    forksByKey,
    pathsByKey
  }
}

async function retrieveValues(fileName, directory) {
  const id = fileName.replace(/\.md$/, '');
  
  const fullPath = path.join(directory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  
    
  const contentHtml = processedContent.toString();
  const processedContentByLine = await Promise.all(
    matterResult.content.split("\n").filter((string) => string !== '').map(async (line) => {
      const processedLine = await remark()
        .use(html)
        .process(line)
      
      return processedLine.toString().trim().replace(/<\/?p>/g, '');
    })
  )

  return {
    id,
    contentHtml,
    content: matterResult.content,
    linesHtml: processedContentByLine,
    ...matterResult.data,
  };
}