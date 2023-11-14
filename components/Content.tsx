import {useState} from "react";
import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import parse from 'html-react-parser';
import TypeIt from "typeit-react";

export default function Content({strings}) {

  return (
    <>
      <TypeIt options={{
        strings: strings,
        waitUntilVisible: true
      }}>
      </TypeIt>
    </>
  )
}
