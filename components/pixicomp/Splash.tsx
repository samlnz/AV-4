import React, { Dispatch, SetStateAction } from 'react'
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { openFullscreen, testMobile, ENV, webpORpng } from '../../utils';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: "#393939",
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: "#E59407",
    },
}));

const Splash = ({ loaded, setOpenGame }: { loaded: boolean, setOpenGame: Dispatch<SetStateAction<boolean>> }) => {
    return (
        <div className='flex flex-col gap-10 w-full flex-1 items-center text-white justify-center bg-black'>
            <div className='flex flex-col gap-8 items-center justify-center'>
                <svg width={243} height={105} className='-rotate-[25deg] text-[#E59407] fill-current'>
                  <use href="#svg-plane" />
                </svg>
                <div className="text-center">
                   <h1 className="text-4xl font-black italic tracking-tighter text-[#E59407]">AVIATOR</h1>
                   <p className="text-xs tracking-[0.3em] opacity-50 uppercase mt-1">BollyGaming Original</p>
                </div>
            </div>
            
            <div className="w-64 flex flex-col items-center gap-4">
              {loaded ? (
                  <button 
                      onClick={() => {
                          setOpenGame(true)
                          if (!testMobile().mobile) openFullscreen()
                      }} 
                      className='w-full py-4 text-xl rounded-xl border-2 border-[#E59407] bg-gradient-to-b from-[#E59407] to-[#412900] uppercase font-black shadow-lg shadow-[#E59407]/20 active:scale-95 transition-transform'
                  >
                    Start Game
                  </button>
              ) : (
                  <div className='w-full'>
                      <BorderLinearProgress />
                      <p className="text-[10px] uppercase text-center mt-2 opacity-40">Loading Assets...</p>
                  </div>
              )}
            </div>
        </div>
    )
}
export default Splash;