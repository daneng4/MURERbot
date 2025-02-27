import React , { useState, useEffect }from "react";
import axios from 'axios' // npm install axios
import "../../css/screen/chatScreen.css"
import "../../css/grid.min.css"
import { Scrollbars } from 'react-custom-scrollbars-2';
import WelcomeChat from "./WelcomeChat"
import LeftChatBubble from "./chatBubble/LeftChatBubble";
import RightChatBubble from "./chatBubble/RightChatBubble";
import WelcomeChatBubble from "./chatBubble/WelcomeChatBubble"
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import {BsFillArrowUpCircleFill} from 'react-icons/bs';

let state = "SUCCESS"
let productName = ""
let intent = "NONE"
let keyPhrase = ""
let imageUrls = []

function initSetting(){
    state = "SUCCESS"
    // productName = ""
    intent = "NONE"
    keyPhrase = ""
}

const ChatScreen = React.forwardRef(({userId, nickName, chatLog,  tempItems, summaryItems, recommandItems, 
    autoScroll, setAutoScroll, informationItems,setTempItems, setSummaryItems, setRecommandItems, setInformationItems,
    openSummaryBook,shakeBubble, setShakeBubble, alarm, setAlarm, openRecommendBook}, scrollbarRef) => {
    const [currentUserId]=useState(userId)
    const [currentNickName]=useState(nickName)
    const [isFirstChat, setIsFirstChat] = useState(true);
    const [inputMessage, setInputMessage] = useState("");
    const [message,setMessage]=useState([]);
    const [isFocused,setIsFocused]=useState(false);
    const [isComposing, setIsComposing]=useState(false);
    const [disable,setDisable]=useState(true);
    const [newMessage,setNewMessage]=useState([])
    const [blockInput,setBlockInput] = useState(false);
    const [topButton,setTopButton] = useState(false)

    useEffect(()=>{
        const input=document.querySelector('input');
        const handleFocus=()=>{
            setIsFirstChat(false);
            setIsFocused(true);
            input.removeEventListener('focus',handleFocus);
        }
        input.addEventListener('focus',handleFocus);
        return ()=>{
            input.removeEventListener('focus',handleFocus);
        }
    },[])
    useEffect(()=>{
        if(chatLog.length!==0) setMessage([...chatLog])
    },[chatLog])

    
    useEffect(()=>{
        inputMessage.length===0?setDisable(true):setDisable(false);
    },[inputMessage])
    useEffect(()=>{
        if(newMessage.length!==0){
            const filterMessage = message.filter((value)=>value[3]!=="LOADING")
            setMessage([...filterMessage,newMessage])
            setNewMessage([])
            setAutoScroll(true)
        }
    },[newMessage,message,setAutoScroll])

    useEffect(()=>{
        if(message.length!==0){
            setIsFirstChat(false);
            setIsFocused(true);
        }
    },[message])

    const handleinputMessage = (e) => {
        setInputMessage(e.target.value)
    }

    const handleFocus=()=>{
        setIsFocused(true);
    }
    const enterKey=(e)=>{
        if(isComposing) return;
        if(inputMessage.length===0)
            return;
        else{
            let isEmptyString = false
            for(let i=0;i<inputMessage.length;i++){
                if(inputMessage[i]===" ")
                    isEmptyString = true
                else
                    break;
            } 
            if(isEmptyString){
                setInputMessage("")
                return;  
            }
        }
        if(e.key==='Enter'){
            if(blockInput) return;
            e.preventDefault();
            let processMessage = [0,0,0,inputMessage,0,1];
             // 상세 상품명 선택해야하는 경우인데 채팅했을 때
            if(state === "REQUIRE_DETAIL"){
                if(intent === "NONE")
                    initSetting()
                else
                    state = "REQUIRE_PRODUCTNAME"
            }
            setBlockInput(true);
            sendInput2Server(processMessage)
            setInputMessage("");
            setAutoScroll(true)
        }
    }
    

    async function sendInput2Server(processMessage, sendMessage=inputMessage) {
        try{
            if(state==="SUCCESS"){
                initSetting()
            }
            const inputData =  {"userId":currentUserId,
                                "text":sendMessage,
                                "state":state,
                                "productName":productName,
                                "intent":intent,
                                "keyPhrase":keyPhrase}
            setMessage([...message,processMessage,[0,0,0,"LOADING",0,0,""]])
            const res = await axios.post(
            `${currentUserId}/user-input`,
            inputData
          );
          // 서버에서 보낸 데이터
          console.log(res.data)
          imageUrls = res.data["imageUrls"]
          state = res.data["state"]
          intent = res.data["intent"]
          keyPhrase = res.data["keyPhrase"]
          let log = res.data["log"];
         // console.log(log);
          log.splice(4,0,0);
          if(imageUrls){
            if(imageUrls.length!==0)
                log.splice(7,0,imageUrls);
          }
          setNewMessage([...log]);
          setBlockInput(false);
          if(state === "FALLBACK")
                initSetting()
        } catch(e) { 
            const code = e.code;
		    const status = e.response?.status;

		    // timeout이 발생한 경우와 서버에서 408 에러를 반환할 때를 동시에 처리하겠습니다.
		    if (code === "ECONNABORTED" || status === 408) {
                const inputData =  {"userId":currentUserId,
                "text": "요청시간이 만료되었습니다.",
                "state":"TIMEOUT",
                "productName":productName,
                "intent":intent,
                "keyPhrase":keyPhrase}
                const filterMessage = message.filter((value)=>value[3]!=="LOADING")
                setBlockInput(false);
                setMessage([...filterMessage,processMessage,[0,0,0,"요청시간이 만료되었습니다.",0,0]])
                await axios.post(
                    `${currentUserId}/timeout`,
                    inputData,
                );
		    }
            else if (status === 500) {
                const inputData =  {"userId":currentUserId,
                "text": "서버에서 에러가 발생하였습니다.",
                "state":"TIMEOUT",
                "productName":productName,
                "intent":intent,
                "keyPhrase":keyPhrase}
                const filterMessage = message.filter((value)=>value[3]!=="LOADING")
                setBlockInput(false);
                setMessage([...filterMessage,processMessage,[0,0,0,"서버에서 에러가 발생하였습니다.",0,0]])
                await axios.post(
                    `${currentUserId}/timeout`,
                    inputData,
                );
		    }
        }
        
    }

    const onClickSend = (sendMessage = inputMessage) => {
        
        if(sendMessage.length===0)return;
        else{
            let isEmptyString = false
            for(let i=0;i<sendMessage.length;i++){
                if(sendMessage[i]===" ")
                    isEmptyString = true
                else
                    break;
            } 
            if(isEmptyString){
                setInputMessage("")
                return;  
            }
        }
        if(blockInput) return;
        let processMessage = [0,0,0,sendMessage,0,1];
        // 상세 상품명 선택해야하는 경우인데 채팅했을 때
        if(state === "REQUIRE_DETAIL"){
            if(intent === "NONE")
                initSetting()
            else
                state = "REQUIRE_PRODUCTNAME"
        }
        setBlockInput(true);
        sendInput2Server(processMessage,sendMessage)
        setInputMessage("");
        setAutoScroll(true)
    }

    const selectProductName = (e) => {
        if(blockInput) return;
        productName = e.target.textContent;
        let processMessage = [0,0,0,productName,0,1];
        if(state==="SUCCESS"){
            keyPhrase = ""
            intent = "NONE"
        }
        state = "REQUIRE_DETAIL"
        sendInput2Server(processMessage);
        setAutoScroll(true)
    }  
    
    const bookmarkAlramEvent = (categoryNum)=>{
        switch(categoryNum){
            case 0:
                setAlarm(alarm.map((value,idx)=>{
                    if(idx===3) return true;
                    return value;
                }))
                break;
            case 1:
                setAlarm(alarm.map((value,idx)=>{
                    if(idx===1) return true;
                    return value;
                }))
                break;
            case 2:
                setAlarm(alarm.map((value,idx)=>{
                    if(idx===2) return true;
                    return value;
                }))
                break;
            case 3:
                setAlarm(alarm.map((value,idx)=>{
                    if(idx===0) return true;
                    return value;
                }))
                break;
            case 5:
                setAlarm(alarm.map((value,idx)=>{
                    if(idx===3) return true;
                    return value;
                }))
                break;
            default:
                setAlarm(alarm.map((value,idx)=>{
                    if(idx===3) return true;
                    return value;
                }))
                break;
        }
       // setAlram(alram.map((value,idx)=>idx===categoryNum));
    }
    
    const selectItemArray=(state)=>{
        switch(state){
            case 0:
                return {setItems:setTempItems, items:tempItems};
            case 1:
                return {setItems:setSummaryItems, items:summaryItems};
            case 2:
                return {setItems:setRecommandItems, items:recommandItems};
            case 3:
                return {setItems:setInformationItems, items:informationItems};
            case 5:
                return {setItems:setTempItems,items:tempItems};  
            default:
                return {setItems:setTempItems,items:tempItems};
        }
    }

    const renderThumbVertical = ({ style, ...props }) => {
        const thumbStyle = {
          backgroundColor: '#B9B9B9', // 변경하고 싶은 색상으로 설정
          borderRadius: '18px',
          width: '8px',
        };
        return <div style={{ ...style, ...thumbStyle }} {...props} />;
    }
    
    const moveScroll=()=>{
        if(scrollbarRef.current)
            scrollbarRef.current.getValues().scrollTop>280?setTopButton(true):setTopButton(false)
    }
    const goTop=()=>{
        if(scrollbarRef.current){
            scrollbarRef.current.scrollTop(0);
            setTopButton(false)
        }
    }
    return(
        <>
        <div className="chat_box">
            <Scrollbars
                renderThumbVertical={renderThumbVertical}
                ref={scrollbarRef}
                onScroll={moveScroll}
                >
                {isFirstChat&&<WelcomeChat/>}
                {isFocused&&<WelcomeChatBubble currentNickName={currentNickName} sendMessage={onClickSend}/>}
                {
                message?message.map((msg,idx)=>(
                    <div key={'div'+idx}>{
                        msg[5]===1?<RightChatBubble key={'right'+idx} message={msg[3]} autoScroll={autoScroll} setAutoScroll={setAutoScroll} scrollbarRef={scrollbarRef}/>:
                        <LeftChatBubble key={'left'+msg[0]} idx={msg[0]} autoScroll={autoScroll} setAutoScroll={setAutoScroll} scrollbarRef={scrollbarRef} userMessage={message[idx-1][3]} itemArray={selectItemArray(msg[2])}
                        firstMessage={false} selectProductName={selectProductName} state={msg[2]===5?"REQUIRE_DETAIL":"SUCCESS"} imageUrls={msg[2]===5 || msg[2] === 2? msg[7]:null}
                        category={msg[2]} message={msg[3]} userId={userId} openSummaryBook={msg[2]===1?openSummaryBook :null} isShake={shakeBubble.includes(msg[0])} shakeBubble={shakeBubble} 
                        setShakeBubble={setShakeBubble} productName={msg[6]} bookmarkAlramEvent={bookmarkAlramEvent} sendMessage={onClickSend} openRecommendBook={msg[2]===2?openRecommendBook:null}
                        recommendModalData={msg[8]}/>
                    }
                    </div>
                    )
                ):null
                }
            </Scrollbars>
            <ToastsContainer className="toaster" store={ToastsStore} position={ToastsContainerPosition.BOTTOM_CENTER}
                                     lightBackground/>
            <div className={topButton?"back_top_visable":"back_top"}>
                <BsFillArrowUpCircleFill className="top_button" onClick={goTop}/>
            </div>
        </div>
        <div className="input_box">
            <div className="input_division_line"></div>
            <div className="under_division_line">
                <input className={blockInput?"block_input_message":"input_message"} onFocus={handleFocus} type="text" name="input_message" 
                placeholder="메시지를 입력하세요" value={inputMessage} onKeyDown={enterKey} onChange={handleinputMessage}
                onCompositionStart={()=>setIsComposing(true)} onCompositionEnd={()=>setIsComposing(false)}/>
                <button className={disable||blockInput?"send_message_button_disable":"send_message_button"} type="button" onClick={(e)=>{e.preventDefault();onClickSend()}}>보내기</button>
            </div>
        </div>
        
        </>
    )

})

export default ChatScreen;