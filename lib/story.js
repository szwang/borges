import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export const forksDir = path.join(process.cwd(), 'garden/forks');
export const pathsDir = path.join(process.cwd(), 'garden/paths');

export async function getStory() {
  const forkNames = fs.readdirSync(forksDir);
  const pathNames = fs.readdirSync(pathsDir);

  const forkData = await Promise.all(
    forkNames.map(async (fileName) => retrieveValues(fileName, forksDir))
  )
  const pathData = await Promise.all(
    pathNames.map(async (fileName) => retrieveValues(fileName, pathsDir))
  )
  
  return {
    forkData,
    pathData
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

  return {
    id,
    contentHtml,
    content: matterResult.content,
    ...matterResult.data,
  };
}