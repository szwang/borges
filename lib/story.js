import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import {keyBy} from 'lodash'

export const forksDir = path.join(process.cwd(), 'garden/forks');
export const pathsDir = path.join(process.cwd(), 'garden/paths');

export async function getStoryTree() {
  const {forkData, pathData, forksByKey, pathsByKey} = await getStory();

  const storyTree = generateTree(pathsByKey, forksByKey, "root")

  return {
    storyTree: [{...storyTree}],
    forksByKey,
    pathsByKey
  }
}

// export function generateTree(pathsByKey, forksByKey, currentPathId, tree) {
//   console.log("in generate tree with", tree)

//   if (!pathsByKey[currentPathId].forks) {
//     return
//   }
//   // go to the bottom of the tree

  

//   pathsByKey[currentPathId].forks.forEach((fork) => {
//     console.log("pushing to fork",forksByKey[fork])
//     tree.forks.push(forksByKey[fork])
//     if (forksByKey[fork].next) {
//       console.log("pushing to children", pathsByKey[forksByKey[fork].next])
//       tree.children.push(pathsByKey[forksByKey[fork].next])
//       generateTree(pathsByKey, forksByKey, forksByKey[fork].next, tree)
//     }
//   })

//   return tree;
// }

function generateTree(pathsByKey, forksByKey, currentPathId) {
  // Get the current path object
  let currentPath = pathsByKey[currentPathId];

  // Check if the current path has forks
  if (!currentPath.forks) {
    return { ...currentPath }; // Return current path as is if no forks
  }

  // Initialize an array to hold child paths
  let children = [];

  // Loop through each fork and recursively build the tree
  for (let forkId of currentPath.forks) {
    let fork = forksByKey[forkId];

    // Check if the fork leads to another path
    if (fork.next) {
      // Recursively build the subtree for the next path
      let childTree = generateTree(pathsByKey, forksByKey, fork.next);
      children.push(childTree); // Add the subtree to the children array
    }
  }

  // Return the current path with its children
  return { ...currentPath, children: children };
}


export async function getStory() {
  const forkNames = fs.readdirSync(forksDir);
  const pathNames = fs.readdirSync(pathsDir);
  
  const pathData = await Promise.all(
    pathNames.map(async (fileName) => retrieveValues(fileName, pathsDir))
  )
  const forkData = await Promise.all(
    forkNames.map(async (fileName) => retrieveValues(fileName, forksDir))
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