// 오류 최소화 및 코드 안정성 높이기
"use strict";

const CARD_IMG = ['bear', 'cow', 'dog', 'eagle', 'elephant', 'flamingo',
    'frog','giraffe', 'horse', 'leopard', 'lion', 'monkey',
    'octopus', 'orca', 'ostrich', 'panda', 'penguin', 'pig', 
    'rabbit', 'raccoon', 'snake', 'squirrel', 'tiger', 'whale', 
    'zebra', 'crab', 'peacock', 'snail', 'hummingbird', 'seahorse'];
let BOARD_SIZE = 16; // 게임판 크기
let cardDeck = []; // 게임판 크기만큼의 카드 저장

let stage = 1; // 게임 스테이지
let time = 60; // 남은 시간
let timer = 0; // 타이머
let score = 0; // 총 점수
let isFlip = false; // 카드 뒤집기 가능 여부

// 기본 값 세팅 및 게임 시작
const playTime = document.getElementById("timer-text");
const timerBar = document.getElementById("timer-bar");
const playStage = document.getElementById("play-stage");
const playScore = document.getElementById("play-score");

window.onload = function() {
    playTime.innerHTML = time;
    playStage.innerHTML = stage;
    playScore.innerHTML = score;
    startGame();
}

// 게임 시작
function startGame() {
    // 카드 덱 생성
    makeCardDeck();
    // 카드 화면에 세팅
    setCardDeck();
    // 전체 카드를 보여준다
    showCardDeck();
}

// 게임 종료
function endGame() {
    showGameResult();
}

// 게임 재시작
function restartGame() {
    // 게임 설정 초기화
    initGame();
    // 게임 화면 초기화
    initScreen();
    // 게임 시작
    startGame();
}

// 카드 덱 생성
function makeCardDeck() {
    /* 1. 30개의 동물 이미지 중 BOARD_SIZE의 절반에 해당하는 만큼 중복없이 랜덤으로 뽑는다
       2. 뽑은 동물 이미지의 짝을 생성하기 위해 똑같은 값들을 복사한다 */
    let randomNumberArr = [];

    for (let i = 0; i < BOARD_SIZE / 2; i++) {
        // 랜덤 값 뽑기 ( 30개 중에서 )
        let randomNumber = getRandomNumber(30, 0);

        /* 중복 검사
            randomNumberArr 안에 random 값이 없다면 배열에 추가
           randomNumberArr 안에 random 값이 있으면 인덱스 1 감소 */
        if (randomNumberArr.indexOf(randomNumber) === -1)
            randomNumberArr.push(randomNumber);
        else 
            i--;
    }

    // 짝을 맞춰주기 위해 복사 (Spread operator와 push()를 이용)
    randomNumberArr.push(...randomNumberArr);
    // 카드 셔플
    shuffle(randomNumberArr);
    // 카드 세팅
    for (let i = 0; i < BOARD_SIZE; i++)
        cardDeck.push({card: CARD_IMG[randomNumberArr[i]], isOpen: false, isMatch: false});

    return cardDeck;
}

// 카드 셔플
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

// 난수 생성
function getRandomNumber(max, min) {
    return parseInt(Math.random() * (max - min)) + min;
}

// 카드 화면에 세팅
const gameBoard = document.getElementsByClassName("game__board")[0];
const cardBack = document.getElementsByClassName("card__back");
const cardFront = document.getElementsByClassName("card__front");

function setCardDeck() {
    // 게임판 생성 : 카드 추가
    for (let i = 0; i < BOARD_SIZE; i++) {
        gameBoard.innerHTML = gameBoard.innerHTML +
        `
            <div class="card" data-id="${i}" data-card="${cardDeck[i].card}">
                <div class="card__back"></div>
                <div class="card__front"></div>
            </div>
        `;
        // 각 동물 이미지 로드
        cardFront[i].style.backgroundImage = `url('media/card_pack/${cardDeck[i].card}.png')`;
    }
}

// 전체 카드 보여주는 함수
function showCardDeck() {
    let cnt = 0; // 현재 뒤집는 카드의 인덱스

    // 카드를 뒤집는 애니메이션 생성
    let showCardPromise = new Promise((resolve, reject) => {
        let showCardTimer = setInterval(() => {
            cardBack[cnt].style.transform = "rotateY(180deg)";
            cardFront[cnt++].style.transform = "rotateY(0deg)";

            if (cnt === cardDeck.length) {
                // 카드 뒤집는 애니메이션 수행 중지
                clearInterval(showCardTimer);
                resolve();
            }
        }, 200);
    });

    showCardPromise.then(() => {
        // showCardPromise 성공인 경우 실행할 코드
        setTimeout(hideCardDeck, 2000);
    })
}

// 전체 카드 숨기는 함수
function hideCardDeck() {
    for (let i = 0; i < cardDeck.length; i++) {
        cardBack[i].style.transform = "rotateY(0deg)";
        cardFront[i].style.transform = "rotateY(-180deg)";
    }
    // 전체 카드 숨기고 0.1초 뒤 isFlip = true, 게임 타이머 시작
    setTimeout(() => {
        isFlip = true;
        // 게임 타이머 시작
        startTimer();
    }, 100);
}

let widthPerSecond = 100 / time; // 초당 막대 바 너비 변화량

// 게임 타이머 시작
function startTimer() {
    widthPerSecond = 100 / time; // 초당 막대 바 너비 변화량

    timer = setInterval(() => {
        time--;
        playTime.innerHTML = time;
        timerBar.style.width = (time * widthPerSecond) + "%";

        if (time <= 0) {
            clearInterval(timer);
            endGame();
        }
        }, 1000);
}

// 카드 클릭 이벤트
gameBoard.addEventListener("click", function(e) {
    if (isFlip === false)
        return;
    /*  카드를 클릭하면 해당 카드가 열려 있는지 확인하고, 
        열려 있지 않은 경우 카드를 열도록 하는 것 */
    if (e.target.parentNode.className === "card") {
        let CardId = e.target.parentNode.dataset.id;

        if (cardDeck[CardId].isOpen === false)
            openCard(CardId);
    }
});

// 카드 오픈
function openCard(id) {
    // 화면에서 카드 앞면이 보이도록 한다
    cardBack[id].style.transform = "rotateY(180deg)";
    cardFront[id].style.transform = "rotateY(0deg)";
    // 선택한 카드의 open 여부를 true로 변경
    cardDeck[id].isOpen = true;

    // 선택한 카드가 첫 번째인지 두 번째인지 판별하기 위해 오픈한 카드의 index를 저장하는 배열 요청
    let openCardIndexArr = getOpenCardArr(id);
    // 선택한 카드가 두 번째인 경우 카드 일치 여부 확인
    if (openCardIndexArr.length === 2) {
        // 일치 여부 확인 전까지 카드 뒤집기 불가
        isFlip = false;
        checkCard(openCardIndexArr);
    }
}

// 오픈한 카드의 index를 저장하는 배열 반환
function getOpenCardArr(id) {
    let openCardIndexArray = [];
    // 반복문을 돌면서 isOpen: true이고 isMatch: false인 카드의 인덱스를 배열에 저장
    cardDeck.forEach((element, i) => {
        if (element.isOpen === false || element.isMatch === true)
            return;

        openCardIndexArray.push(i);
    });

    return openCardIndexArray;
}

// 카드 일치 여부 확인
function checkCard(indexArr) {
    let firstCard = cardDeck[indexArr[0]];
    let secondCard = cardDeck[indexArr[1]];

    if (firstCard.card === secondCard.card) {
        firstCard.isMatch = true;
        secondCard.isMatch = true;
        // 카드 일치 처리
        matchCard(indexArr);
    } 
    else {
        firstCard.isOpen = false;
        secondCard.isOpen = false;
        // 카드 불일치 처리
        closeCard(indexArr);
    }
}

// 카드 일치 처리
function matchCard(indexArr) {
    // 카드를 전부 찾았으면 스테이지 클리어
    if (checkAllClear() === true) {
        clearStage();
        return;
    }
    // 0.1초 뒤 isFlip = true
    setTimeout(() => {
        isFlip = true;
    }, 100);
}

// 카드를 전부 찾았는지 확인하는 함수
function checkAllClear() {
    let isClear = true;

    cardDeck.forEach((element) => {
        // 반복문을 돌면서 isMatch: false인 요소가 있다면 isClear에 false 값을 저장 후 반복문 탈출
        if (element.isMatch === false) {
            isClear = false;
            return;
        }
    });

    return isClear;
}

// 카드 불일치 시 timerBar 진동하는 효과
const vibration = (target) => {
    target.classList.add("vibration");
  
    setTimeout(function() {
      target.classList.remove("vibration");
    }, 200);
}

// 카드 불일치 처리
function closeCard(indexArr) {
    time -= 1; //틀리면 1초 차감
    vibration(timerBar);
    // 0.5초 동안 카드 보여준 후 닫기
    setTimeout(() => {
        for (let i = 0; i < indexArr.length; i++) {
            cardBack[indexArr[i]].style.transform = "rotateY(0deg)";
            cardFront[indexArr[i]].style.transform = "rotateY(-180deg)";
        }
        isFlip = true;
    }, 500);
}

// 스테이지 클리어
const board = document.getElementsByClassName("board")[0];
const stageClearImg = document.getElementsByClassName("stage-clear")[0];

function clearStage() {
    clearInterval(timer);
    time = 60 - (stage * 5); // 스테이지 진행 시 마다 5초씩 감소
    stage++; // 스테이지 값 1 추가
    cardDeck = [];

    if (stage <= 2)
        score += 10;
    else if (stage == 3) {
        score += 20;
        BOARD_SIZE = 20;
    }        
    else if (stage == 4)
        score += 30;
    else if (stage == 5) {
        score += 40;
        BOARD_SIZE = 24;
    }
    else if (stage <= 8)
        score += 50;
    // 총 스테이지는 8개로 구성 -> stage = 9 도달 시 게임 종료
    else {
        stage--;
        endGame();
    }

    stageClearImg.classList.add("show");

    // 2초 후 다음 스테이지 시작
    setTimeout(() => {
        stageClearImg.classList.remove("show");
        initScreen();
        startGame();

        
        // 스테이지 5부터는 카드 수 증가에 맞게 게임판 규격 조정
        if (stage >= 5) {
            const cardDivs = document.querySelectorAll('.card');  
            // 모든 요소에 대해 스타일 변경
            for (let i = 0; i < cardDivs.length; i++) 
                cardDivs[i].style.width = '16.6666667%';
        }
        // 스테이지 3부터는 카드 수 증가에 맞게 게임판 규격 조정
        else if (stage >= 3) {
            const cardDivs = document.querySelectorAll('.card');  
            // 모든 요소에 대해 스타일 변경
            for (let i = 0; i < cardDivs.length; i++) 
                cardDivs[i].style.width = '20%';
        }
    }, 2000);
}

// 게임 종료 시 출력 문구
const modal = document.getElementsByClassName("modal")[0];

function showGameResult() {
    let resultText = "";

    if (stage <= 2) 
        resultText = "한 번 더 해볼까요?";
    else if (stage <= 4)
        resultText = "조금만 더 해봐요!";
    else if (stage <= 5) 
        resultText = "실력이 대단해요!";
    else if (stage <= 7)
        resultText = "기억력이 엄청나시네요!";
    else
        resultText = "누구보다 뛰어난 기억력을 가지셨습니다!";

    modalTitle.innerHTML = `
    <h1 class="modal__content-title--result color-red">
        게임 종료!
    </h1>
    <span class="modal__content-title--stage">
        기록 : <strong>STAGE ${stage}</strong><br>
        점수 : <strong>SCORE ${score}</strong>
    </span>
    <p class="modal__content-title--desc">
        ${resultText}
    </p>
    `;

    modal.classList.add("show");
}

// 모달창 닫으면 게임 재시작
const modalTitle = document.getElementsByClassName("modal__content-title")[0];
const modalCloseButton = document.getElementsByClassName("modal__content-close-button")[0];

modal.addEventListener('click', function(e) {
    if (e.target === modal || e.target === modalCloseButton) {
        modal.classList.remove("show");
        restartGame();
    }
});

// 게임 설정 초기화
function initGame() {
    BOARD_SIZE = 16
    stage = 1;
    score = 0;
    time = 60;
    widthPerSecond = 100 / time;
    timerBar.style.width = (time * widthPerSecond) + "%";
    isFlip = false;
    cardDeck = [];
}

// 게임 화면 초기화
function initScreen() {
    gameBoard.innerHTML = '';
    playTime.innerHTML = time;
    widthPerSecond = 100 / time;
    timerBar.style.width = (time * widthPerSecond) + "%";
    playStage.innerHTML = stage;
    playScore.innerHTML = score;
    playTime.classList.remove("blink");
    void playTime.offsetWidth;
    playTime.classList.add("blink");
}