import React,{useState} from "react";
import { useLocation } from "react-router-dom";
import "../css/chat.css";
import ChatMenu from "./menu/ChatMenu";
import ChatScreen from "./screen/ChatScreen";
import "../css/screen/chatScreen.css"
import "../css/menu/chatMenu.css"
import axios from 'axios' // npm install axios

const Chat = () => {
    const location=useLocation()
    const [tempItems,setTempItems]=useState([]);
    const [summaryItems,setSummaryItems] = useState([]);
    const [comparisonItems,setComparisonItems]=useState([]);
    const [recommandItems,setRecommandItems]=useState([]);
    const [informationItems,setInformationItems]=useState([]);
    const {userId, nickName, log}=location.state
    //console.log(tempItems)

    getLogFromServer()
    async function getLogFromServer() {
        try{
            const inputData =  {"userId":userId}
            const res = await axios.post(
            "/sendLog",
            inputData
          );
          console.log(res.data);
          // {"state":"SUCCESS"/"FALLBACK", "log":[~]}
        } catch(e) {
            console.error(e)
        }
    }


    return <>
        <aside className="chatMenu">
            <ChatMenu tempItems={tempItems} summaryItems={summaryItems} comparisonItems={comparisonItems}
             recommandItems={recommandItems} informationItems={informationItems}/>
        </aside>
        <section className="chatScreen">
            <ChatScreen userId={userId} nickName={nickName} chatLog={log}
            tempItems={tempItems} summaryItems={summaryItems} comparisonItems={comparisonItems}
            recommandItems={recommandItems} informationItems={informationItems}
            setTempItems={setTempItems} setSummaryItems={setSummaryItems}
            setComparisonItems={setComparisonItems} setRecommandItems={setRecommandItems} setInformationItems={setInformationItems}/>
        </section>
    </>;
}

export default Chat;