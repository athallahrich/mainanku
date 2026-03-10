import React, { useState, useEffect } from 'react';

const WHEEL_URL = '/assets/wheel.png';
const ARROW_URL = '/assets/arrow.png';
const BEAN_ASSETS = [
    { name: "Toasted Marshmallow or Stink Bug", image: "/assets/bean-0.png" },
    { name: "Licorice or Burnt Rubber", image: "/assets/bean-1.png" },
    { name: "Stinky Socks or Tutti-Fruitti", image: "/assets/bean-2.png" },
    { name: "Juicy Pear or Booger", image: "/assets/bean-3.png" },
    { name: "Strawberry Banana Smoothie or Dead Fish", image: "/assets/bean-4.png" },
    { name: "Berry Blue or Toothpaste", image: "/assets/bean-5.png" },
    { name: "Cappuccino or Liver & Onions", image: "/assets/bean-6.png" },
    { name: "Peach or Barf", image: "/assets/bean-7.png" },
    { name: "Pomegranate or Old Bandage", image: "/assets/bean-8.png" },
    { name: "Top Banana or Wet Dog", image: "/assets/bean-9.png" },
];

function BeanBoozled({ onBack }) {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [shuffleIndex, setShuffleIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const spinSound = React.useRef(new Audio('/assets/spin-sound.mp3'));

    useEffect(() => {
        let interval;
        if (isSpinning) {
            spinSound.current.currentTime = 0;
            spinSound.current.play().catch(e => console.log("Audio play blocked:", e));
            interval = setInterval(() => {
                setShuffleIndex((prev) => (prev + 1) % 10);
            }, 80);
        } else {
            clearInterval(interval);
            spinSound.current.pause();
        }
        return () => clearInterval(interval);
    }, [isSpinning]);

    const handleSpin = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setShowResult(false);

        const extraRotations = (5 + Math.random() * 5) * 360;
        const randomAngle = Math.random() * 360;
        const totalRotation = rotation + extraRotations + randomAngle;

        setRotation(totalRotation);

        setTimeout(() => {
            setIsSpinning(false);
            calculateResult(totalRotation);
        }, 7000);
    };

    const calculateResult = (finalRotation) => {
        const normalizedAngle = (finalRotation % 360);
        const sliceIndex = Math.floor((normalizedAngle + 18) / 36) % 10;
        setResult(BEAN_ASSETS[sliceIndex]);
        setShowResult(true);
    };

    const currentBean = isSpinning ? BEAN_ASSETS[shuffleIndex] : result;

    return (
        <div className="game-wrapper">
            <button className="back-button" onClick={onBack}>← Back to Dashboard</button>

            <div className="game-container">
                <div className="side-content">
                    <h1 className="title">Spin the wheel.<br />We dare you!</h1>
                    <p className="subtitle">Watch real reactions to BeanBoozled.</p>
                </div>

                <div className="spinner-section">
                    <img src={WHEEL_URL} alt="Spinner Wheel" className="wheel-image" />
                    <button
                        className="arrow-button"
                        onClick={handleSpin}
                        style={{ transform: `translate(-50%, -50%) rotate(${rotation - 85}deg) scale(2.4)` }}
                    >
                        <img src={ARROW_URL} alt="Arrow" className="arrow-image" />
                    </button>
                    <div className="click-hint">[click wheel to play]</div>
                </div>

                <div className="result-section">
                    <div className="bean-container" style={{ opacity: isSpinning || showResult ? 1 : 0 }}>
                        {currentBean && (
                            <img
                                key={currentBean.image}
                                src={currentBean.image}
                                alt={currentBean.name}
                                className={`bean-image ${showResult ? 'zoom-in' : ''}`}
                            />
                        )}
                    </div>
                    <div className="result-text" style={{ opacity: showResult ? 1 : 0 }}>
                        {result && result.name}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BeanBoozled;
