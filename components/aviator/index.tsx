import React, { useState, useEffect } from 'react'
import GameBoard from "./GameBoard"
import axios, { AxiosError } from 'axios'
import io from 'socket.io-client'
import { useAviator } from '../../store/aviator'
import AccessDenied from '../AccessDenied'
import { Assets } from 'pixi.js'
import { urls } from '../../utils/urls'
import Splash from '../pixicomp/Splash'
import { Game_Global_Vars, initBet6, loadSound, ENV } from '../../utils'
import TopLogoBar from '../TopLogoBar'
import RuleModal from '../RuleDialog'
import SettingModal from '../SettingModal'
import HistoryModal from '../HistoryModal'

const Aviator = () => {
    const { aviatorState, setAviatorState } = useAviator()
    const [loaded, setLoaded] = useState(false)
    const [openGame, setOpenGame] = useState(false)
    const [bet6, setBet6] = useState<string[]>(initBet6)
    const [ruleModalOpen, setRuleModalOpen] = useState(false)
    const [settingModalOpen, setSettingModalOpen] = useState(false)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)

    useEffect(() => {
        Game_Global_Vars.betValue = [bet6[0], bet6[0]]
    }, [bet6])

    useEffect(() => {
        let socketInstance: any = null;

        const init = async () => {
            try {
                // Ensure base URL is set correctly for all requests
                axios.defaults.baseURL = ENV.API_URL;
                axios.defaults.timeout = 15000;

                const urlParams = new URLSearchParams(window.location.search);
                const token: string = urlParams.get('token') || "demo-token";

                axios.defaults.headers.common['token'] = token;

                // Load PIXI assets and sounds
                await Assets.load(urls);
                loadSound();

                // Fetch initial configuration
                try {
                  const response = await axios.post('/api/config');
                  if (response.data?.data) {
                    const cfg = response.data.data;
                    localStorage.setItem('bet6', JSON.stringify(cfg.config.chips.slice(0, 6).map((item: any) => `${item}`)));
                    Game_Global_Vars.stake = {
                        max: cfg.maxStake || 10000,
                        min: cfg.minStake || 10
                    };
                    setAviatorState(prev => ({
                        ...prev,
                        balance: cfg.user?.account?.balance || 1000,
                    }));
                  }
                } catch (e) {
                  console.warn("Config fetch failed, game may run with demo defaults");
                }

                // Initialize WebSocket
                socketInstance = io(ENV.SOCKET_URL, {
                    auth: { token },
                    transports: ["websocket"]
                });

                setAviatorState(prev => ({ ...prev, socket: socketInstance, token }));
                
                socketInstance.on('connect', () => console.log('WebSocket Connected'));
                socketInstance.on('error', (err: any) => console.error('WebSocket Error', err));

                setLoaded(true);
            } catch (e) {
                console.error("Critical Initialization error", e);
                setLoaded(true); // Proceed to show UI even on error for debugging
            }
        };

        init();

        return () => {
            if (socketInstance) {
                socketInstance.removeAllListeners();
                socketInstance.disconnect();
            }
        }
    }, []);

    return (
        <div className="flex flex-col h-screen w-screen bg-black overflow-hidden select-none">
            <TopLogoBar loaded={loaded} setSettingModalOpen={setSettingModalOpen} setHistoryModalOpen={setHistoryModalOpen} setRuleModalOpen={setRuleModalOpen} />
            {
                aviatorState.auth ?
                    (openGame && loaded ?
                        <GameBoard bet6={bet6} />
                        :
                        <Splash loaded={loaded} setOpenGame={setOpenGame} />)
                    :
                    <AccessDenied />
            }
            <RuleModal open={ruleModalOpen} setOpen={setRuleModalOpen} />
            <SettingModal open={settingModalOpen} setOpen={setSettingModalOpen} bet6={{ bet6, setBet6 }} />
            <HistoryModal loaded={loaded} open={historyModalOpen} setOpen={setHistoryModalOpen} />
        </div>
    )
}
export default Aviator;