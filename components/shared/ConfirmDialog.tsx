"use client";
import { Modal } from "@mantine/core";
import styles from "./ConfirmDialog.module.css";
export function ConfirmDialog({opened,title,description,confirmLabel="Delete",busy=false,onCancel,onConfirm}:{opened:boolean;title:string;description:string;confirmLabel?:string;busy?:boolean;onCancel:()=>void;onConfirm:()=>void}){return <Modal opened={opened} onClose={onCancel} centered title={title} classNames={{content:styles.content,header:styles.header,body:styles.body,title:styles.title}}><p>{description}</p><div className={styles.actions}><button onClick={onCancel} disabled={busy}>Cancel</button><button className={styles.danger} onClick={onConfirm} disabled={busy}>{busy?"Deleting…":confirmLabel}</button></div></Modal>}
