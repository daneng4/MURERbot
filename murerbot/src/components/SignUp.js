import React, { useState } from "react";
import { Link } from 'react-router-dom'
import "../css/signup.css"

function SignUp(){
    const [inputId, setInputId] = useState('')
    const [inputPw, setInputPw] = useState('')
    const [reInputPw, setReInputPw] = useState('')
    const [inputName, setInputName] = useState('')

    const handleInputId = (e) => {
        setInputId(e.target.value)
    }
    const handleInputPw = (e) => {
        setInputPw(e.target.value)
    }
    const handleReInputPw = (e) => {
        setReInputPw(e.target.value)
    }
    const handleInputName = (e) => {
        setInputName(e.target.value)
    }

    const onClickSignUp = () => {
        console.log('click signup')
    }

    return (
        <div class="signup_div">
            <div class="signup_title_div">
                <h1>물어봇</h1>
            </div>
                <div class="signup_label_div"> 
                    <label htmlFor='input_id'>ID</label>
                </div><br/>
                <input class="signup_input" type='text' name='input_id' value={inputId} onChange={handleInputId}/><br/>
                <div class="signup_label_div">
                    <label htmlFor='input_pw'>PW </label>
                </div><br/>
                <input class="signup_input" type='password' name='input_pw' value={inputPw} onChange={handleInputPw}/><br/>
                <div class="signup_label_div">
                    <label htmlFor='input_pw'>PW Check</label>
                </div><br/>
                <input class="signup_input" type='password' name='reInput_pw' value={reInputPw} onChange={handleReInputPw}/><br/>
                <div class="signup_label_div">
                    <label htmlFor='input_name'>Name</label>
                </div><br/>
                <input class="signup_input" type='text' name='input_name' value={inputName} onChange={handleInputName}/><br/><br/>
            <Link to="/">
                <button type='button' onClick={onClickSignUp}>회원가입</button>
            </Link>
    </div>
    )
}
export default SignUp;