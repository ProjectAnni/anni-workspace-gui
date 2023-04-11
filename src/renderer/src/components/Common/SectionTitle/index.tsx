import React from "react";
import classNames from "classnames";
import styles from "./index.module.scss";

interface Props {
    text: string;
    className?: string;
}

const SectionTitle: React.FC<Props> = (props) => {
    const { text, className } = props;
    return (
        <div className={classNames(styles.sectionTitle, className)}>
            <div className={styles.title}>{text}</div>
            <div className={styles.divider} />
        </div>
    );
};

export default SectionTitle;
