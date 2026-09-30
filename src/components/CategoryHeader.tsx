import React from "react";
import styles from "./CategoryHeader.module.css";

interface CategoryHeaderProps {
  title: string;
  description: string;
}

export default function CategoryHeader({ title, description }: CategoryHeaderProps) {
  return (
    <section className={styles.headerWrapper} aria-label={`${title} Category Header`}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </section>
  );
}
