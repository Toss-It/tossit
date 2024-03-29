import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { SocketContext } from '../../context/socket';
import TimerDisplay from '../../components/TimerDisplay';
import '../../styles/admin/AdminHome.scss';
import ErrorDisplay from '../../components/ErrorDisplay';
import PlayerWorkDisplay from '../../components/PlayerWorkDisplay';

const AdminPlay = ({ players, timerData, handleOpenSummary }) => {
    const socket = React.useContext(SocketContext);
    const params = useParams();
    
    const [tossIteration, setTossIteration] = React.useState(0);
    const [returned, setReturned] = React.useState(false);
    
    const canForceSetTosses = tossIteration === 0;
    const tossedPlayers = players.filter(player => (!player.toss.flagged && player.toss.question && player.toss.answer));
    const canToss = (tossedPlayers.length >= 2) && (tossedPlayers.length === players.length) && (tossIteration < players.length - 1);
    const canReturn = !returned && tossIteration > 0;
    const canSummary = returned;
    
    const handleTossRoom = React.useCallback(() => {
        setTossIteration(tossIteration + 1);
        // TODO: add animation after clicking the toss button
    }, [tossIteration]);

    React.useEffect(() => {
        socket.once('forceTossRoom', () => {
            handleTossRoom();
            // TODO: change state to hide timer
        });
    }, []);

    return (
        <>
            <nav id='nav-bar' style={{
                height: 100,
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <h1 style={{verticalAlign: 'middle', textAlign: 'middle'}}>Planes:</h1>
                <button
                    className='small-button'
                    style={{ width: 'auto', paddingLeft: '1rem', paddingRight: '1rem', margin: '1rem', opacity: canForceSetTosses ? 1 : 0.5, fontSize: '1.5vw' }}
                    disabled={!canForceSetTosses}
                    onClick={() => {
                        socket.emit('forceSetRoomTosses', params.roomCode);
                    }}
                >
                    Force Save Tosses
                </button>
                <button
                    className='small-button'
                    style={{ width: 'auto', paddingLeft: '1rem', paddingRight: '1rem', margin: '1rem', opacity: canToss ? 1 : 0.5, fontSize: '1.5vw' }}
                    disabled={!canToss}
                    onClick={() => {
                        socket.emit('tossRoom', params.roomCode);
                        handleTossRoom();
                    }}
                >
                    {tossIteration >= 1 ? 'Toss Again' : 'Toss'}
                </button>
                { tossIteration >= players.length - 1 &&
                    <ErrorDisplay
                        errorMessage='Max Toss Limit Reached!'
                    />
                }
                <button
                    className='small-button'
                    style={{ width: 'auto', paddingLeft: '1rem', paddingRight: '1rem', margin: '1rem', opacity: canReturn ? 1 : 0.5, fontSize: '1.5vw' }}
                    disabled={!canReturn}
                    onClick={() => {
                        socket.emit('returnTosses', params.roomCode);
                        setReturned(true);
                    }}
                >
                    Return Tosses
                </button>
                <button
                    className='small-button'
                    style={{ width: 'auto', paddingLeft: '1rem', paddingRight: '1rem', margin: '1rem', opacity: canSummary ? 1 : 0.5, fontSize: '1.5vw' }}
                    disabled={!canSummary}
                    onClick={handleOpenSummary}
                >
                    Summary
                </button>
                {tossIteration === 0 && 
                <TimerDisplay
                    startTime={timerData.start}
                    durationSeconds={timerData.durationSeconds}
                />}
            </nav>
            <main>
                <PlayerWorkDisplay
                    players={players}
                    roomCode={params.roomCode}
                    socket={socket}
                />
            </main>

            <div id='footer' style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                {tossIteration > 0 &&
                    <div style={{ display: 'flex', marginLeft: 'auto', marginRight: '15px', fontSize: '0.7rem', padding: '0.4rem' }}>
                        <h2>Everyone has tossed {tossIteration} time{tossIteration === 1 ? '' : 's'}.</h2>
                    </div>
                }
            </div>
        </>
    );
}
AdminPlay.propTypes = {
    players: PropTypes.array.isRequired,
    timerData: PropTypes.object.isRequired,
    handleOpenSummary: PropTypes.func.isRequired,
};

export default AdminPlay;