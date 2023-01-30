import styles from './toolpalettes.module.css';

export const ToolPalettes = () => {
  return (
    <div id="toolpalettes" className={styles.toolpalettes}>
      <div id="select" className={styles.tool}>
        <div>↖︎</div>
      </div>
      <div id="text2path" className={styles.tool}>
        <div>T</div>
      </div>
    </div>
  );
};
