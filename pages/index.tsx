import Head from "next/head";
import styles from "../styles/Home.module.css";
import { GetStaticProps } from "next";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>farmnport</title>
        <link rel="icon" href="/farmnport.svg" />
      </Head>
    </div>
  );
}
