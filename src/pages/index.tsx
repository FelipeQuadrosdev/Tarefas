import { GetStaticProps } from "next";
import Head from "next/head";
import styles from "../styles/home.module.css"
import Image from "next/image";
import heroImg from "../../public/assets/hero.png"

import { db } from "../services/firebaseConnection"
import {
  collection,
  getDocs
} from "firebase/firestore";

interface HomeProps{
  posts:number;
  comments:number;
}

export default function Home({comments,posts}:HomeProps) {

  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            src={heroImg}
            alt="logo Tarefas+"
            priority
          />
          <h1 className={styles.title}>Sistema feito para organizar <br />
            seus estudos e tarefas
          </h1>
        </div>
        <div className={styles.infoContet}>
          <section className={styles.box}>
            <span>+{posts} posts</span>
          </section>

          <section className={styles.box}>
            <span>+{comments} comentários</span>
          </section>
        </div>

      </main>
    </div>

  );
}

export const getStaticProps: GetStaticProps = async () => {

  const commentRef = collection(db, "comments")
  const postRef = collection(db, "task")

  const commmentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commmentSnapshot.size || 0
    },
    revalidate:60
  }
}
