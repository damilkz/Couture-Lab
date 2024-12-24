// UI-related modules
import { MutableRefObject, useEffect } from "react";
import { Input } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Sidebar } from "react-pro-sidebar";
import styles from '../ComponentStyles/stylingAssistant.module.css';
import 'react-dots-loader/index.css';

// Utility modules
import { displayUserStylingPreferences } from "../Pages/Profile";
import parse from "html-react-parser";
import { AutoScrollContainer } from "react-auto-scroll-container";
import Loader from "react-dots-loader";
import Linkify from "linkify-react";

interface Props {
    collapsed: boolean,
    chatInput: string,
    queryLog: string[],
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>,
    handleQuery: (event: React.FormEvent<HTMLFormElement> | string) => void,
    questionnaireRef: MutableRefObject<object>,
    responseLog: string[],
    setChatInput: React.Dispatch<React.SetStateAction<string>>
}

export default function StylingAssistant({ 
            collapsed, chatInput, queryLog, setCollapsed, handleQuery,
            questionnaireRef, responseLog, setChatInput
}: Props) {

    const toggleCollapse = () => {
        setCollapsed(prevState => {
            return !prevState;
        });
    }

    useEffect(() => {
        async function fetchData() {
            questionnaireRef.current = await displayUserStylingPreferences();
        }
        fetchData();
    });

    return (
        <div className={styles['sidebar-container']}>
            <Sidebar
                collapsedWidth="0vw"
                collapsed={collapsed}
                width="100vw"
                backgroundColor="white"
                style=
                {{
                    opacity: collapsed ? 0 : 1,
                    position: "fixed",
                    fontFamily: "MarkPro",
                    height: "100%",
                    zIndex: 2
                }}>
                    <AutoScrollContainer
                        percentageThreshold={100}
                        className={styles['answer-log']}>
                        {queryLog.length !== 0 ? queryLog.map((query, index) => {
                            return (
                                <div key={index}>
                                    <p className={styles['chatbot-query']}>
                                        You: {query}
                                    </p>
                                    <br />
                                    {typeof(responseLog[index]) === "string" ?
                                        <Linkify 
                                            options={{
                                                target: "_blank",
                                                className: styles.link
                                            }}>
                                            <p className={styles.response}>
                                                {parse(responseLog[index])}
                                            </p>
                                        </Linkify> : 
                                        <Loader 
                                            size={8}
                                            color="black"
                                            style={{ marginLeft: "0.1em" }} />}
                                    <br />
                                    <br />
                                </div>
                            )
                        }) : 
                        <strong className={styles['starter-text']}>
                            Ask me anything fashion-related!
                        </strong>}
                    </AutoScrollContainer>
                    <form
                        className={styles['chatbot-container']}
                        onSubmit={handleQuery}>
                            <Input
                                width="97%"
                                minHeight="8vh"
                                value={chatInput}
                                variant="filled"
                                borderColor="gray"
                                focusBorderColor="black"
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="Chat with Your Styling Assistant"/>
                            <button className={styles['query-button']}>
                                <span data-state="closed">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="text-white dark:text-black">
                                            <path
                                                d="M7 11L12 6L17 11M12 18V7"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"></path>
                                    </svg>
                                </span>
                            </button>
                        </form>
            </Sidebar>
            <button
                className={`${styles["sidebar-button"]} ${collapsed && styles["sidebar-hidden"]}`}
                onClick={toggleCollapse}>
                    { collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon /> }
            </button>
        </div>
    )
}