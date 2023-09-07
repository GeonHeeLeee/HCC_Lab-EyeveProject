import * as React from 'react';
import styles from './teacherPage.module.css';

function TeacherPage(): JSX.Element {
  return (
    <div className={styles.teacherPageBox}>
      <div className={styles.teacherPageBox1}>
        <div className={styles.noteVideoContainer}>
          <div className={styles.lectureNote}></div>
          <div className={styles.studentVideo}></div>
        </div>
        <div className={styles.footer}></div>
      </div>
      <div className={styles.teacherPageBox2}></div>
    </div>
  );
}

export default TeacherPage;
