import { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import style from "./styles.module.css"
import { TextArea } from "../../components/textarea"
import { GetServerSideProps } from "next";

import { db } from "../../services/firebaseConnection";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    addDoc,
    getDocs,
    deleteDoc,
} from "firebase/firestore"

import { FaTrash } from "react-icons/fa";

interface TaskProps {
    item: {
        task: string,
        taskPublic: boolean,
        created: string,
        user: string,
        taskId: string,
    };
    allComments: CommentsProps[]
}

interface CommentsProps {
    id: string,
    comment: string,
    name: string,
    taskId: string,
    user: string
}

export default function Task({ item, allComments }: TaskProps) {
    const { data: session } = useSession();

    const [input, setInput] = useState("");
    const [comments, setComments] = useState<CommentsProps[]>(allComments || [])

    async function handleComment(event: FormEvent) {
        event.preventDefault();

        if (input === "") return;

        if (!session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                create: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            })
            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            }
            setComments((olditem) => [...olditem, data])

            setInput("")

        } catch (error) {
            console.log(error);
        }
    }

    async function handleDeleteComment(id: string) {
        try {
            const deleteRef = doc(db, "comments", id)
            await deleteDoc(deleteRef)
            const deleteComment = comments.filter((item)=> item.id!==id )
            setComments(deleteComment)
            
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className={style.container}>
            <Head>
                <title>Tarefa - Detalhe da tarefa</title>
            </Head>
            <main className={style.main}>
                <h1>Tarefa</h1>
                <article className={style.task}>
                    <p>{item.task}</p>
                </article>
            </main>


            <section className={style.commentsContainer}>
                <h2>Deixar comentário</h2>
                <form onSubmit={handleComment}>
                    <TextArea
                        value={input}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                            setInput(event.target.value)}
                        placeholder="Digite seu comentário..."
                    />
                    <button disabled={!session?.user} className={style.button} type="submit">Enviar comentario</button>
                </form>
            </section>

            <section className={style.commentsContainer}>
                <h2>Todos Comentários</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentário foi encontrado...</span>
                )}
                {comments.map((item) => (
                    <article key={item.id} className={style.comment}>
                        <div className={style.headComment}>
                            <label className={style.commentsLabel}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button className={style.buttonTrash} onClick={() => handleDeleteComment(item.id)}>
                                    <FaTrash size={18} color="#ea3140" />
                                </button>
                            )}
                        </div>
                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>

        </div>
    )

}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string
    const docRef = doc(db, "task", id)


    const q = query(collection(db, "comments"), where("taskId", "==", id))
    const snapshotComments = await getDocs(q)
    let allComments: CommentsProps[] = []

    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            name: doc.data().name,
            taskId: doc.data().taskId,
            user: doc.data().user,
        })
    })
    console.log(allComments)

    const snapshot = await getDoc(docRef)

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    if (!snapshot.data()?.taskPublic) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }
    const miliseconds = snapshot.data()?.created?.seconds * 1000;
    const task = {
        task: snapshot.data()?.tarefa,
        taskPublic: snapshot.data()?.taskPublic,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    return {
        props: {
            item: task,
            allComments: allComments
        }
    }

}