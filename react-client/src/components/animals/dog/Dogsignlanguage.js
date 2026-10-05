import React from 'react';
import ReactPlayer from 'react-player';

export default function DogSignlanguage() {
    return (
        <div className='player-wrapper'>
            <ReactPlayer
                className='react-player'
                url='https://firebasestorage.googleapis.com/v0/b/silentscholars-299b2.appspot.com/o/cat-sign-language.mp4?alt=media&token=56b09d60-bd55-437e-9c65-f47fdde410ec'
                width='100%'
                height='100%'
                controls={true}
            />
        </div>
    );
}
