import styled from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { Html5Qrcode } from 'html5-qrcode';
import L from 'leaflet';

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  margin: 0;
  background: ${props => props.transparent ? 'none' : '#fff'};
  font-family: 'Inter', Arial, sans-serif;
  overflow-x: hidden;
`;

const Header = styled.div`
  padding: 24px 0 0 0;
  text-align: center;
  margin: 0 16px;
`;
const Logo = styled.div`
  margin-bottom: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  img { width: 240px; height: auto; }
`;
const Greeting = styled.div`
  color: #A2A9C2;
  font-size: 18px;
  margin: 16px 16px 0 16px;
  text-align: left;
  span { display: block; font-weight: 700; color: #222; font-size: 22px; margin-top: 2px; }
`;
const OrderCard = styled.div`
  background: #3B5CB8;
  color: #fff;
  border-radius: 16px;
  margin: 20px 16px 16px 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;
const OrderRow = styled.div`
  display: flex;
  align-items: center;
`;
const OrderImg = styled.div`
  width: 48px; height: 48px; border-radius: 50%; background: #fff; margin-right: 12px;
  img { width: 100%; border-radius: 50%; }
`;
const OrderInfo = styled.div`
  flex: 1;
`;
const OrderTitle = styled.div`
  font-weight: 700; font-size: 18px;
`;
const OrderDesc = styled.div`
  font-size: 14px; color: #c7d3fa;
`;
const OrderDetails = styled.div`
  display: flex; justify-content: space-between; margin-top: 12px; font-size: 15px; color: #c7d3fa;
`;
const SearchBarWrapper = styled.div`
  margin: 0 16px 16px 16px;
  border-radius: 12px;
  background: #F5F7FB;
`;
const SearchBar = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #A2A9C2;
  outline: none;
  box-sizing: border-box;
  text-align: left !important;
  &::placeholder {
    text-align: left;
    color: #A2A9C2;
    opacity: 1;
  }
`;
const MapBlock = styled.div`
  background: #F5F7FB;
  border-radius: 16px;
  margin: 0 16px 0 16px;
  padding: 16px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const MapTitle = styled.div`
  color: #A2A9C2;
  font-size: 16px;
  margin: 0 0 8px 16px;
`;
const StyledMap = styled.div`
  width: 100%;
  height: 180px;
  border-radius: 16px;
  overflow: hidden;
`;
const BottomNav = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  width: 100vw;
  background: #fff;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  z-index: 100;
`;
const NavIcon = styled.div`
  width: ${props => props.center ? '48px' : '32px'};
  height: ${props => props.center ? '48px' : '32px'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.center ? '16px' : '8px'};
  background: ${props => props.center ? '#3B5CB8' : 'transparent'};
  position: relative;
  margin-bottom: 8px;
  img {
    width: ${props => props.center ? '32px' : '24px'};
    height: ${props => props.center ? '32px' : '24px'};
    ${props => props.center && props.active ? '' : 'filter: none;'}
  }
  &::after {
    content: '';
    display: ${props => props.active ? 'block' : 'none'};
    position: absolute;
    left: 50%;
    bottom: -8px;
    transform: translateX(-50%);
    width: 24px;
    height: 3px;
    border-radius: 2px;
    background: #D1D5DB;
  }
`;
const ScanScreenWrapper = styled.div`
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 64px;
  width: 100vw;
  height: auto;
  background: none;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const CameraView = styled.div`
  flex: 1;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  position: relative;
`;
const ScanFrame = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 220px;
  height: 220px;
  transform: translate(-50%, -50%);
  border-radius: 32px;
  border: 4px solid rgba(255,255,255,0.0);
  box-sizing: border-box;
  pointer-events: none;
  z-index: 2;
  &::before, &::after {
    content: '';
    position: absolute;
    width: 48px;
    height: 48px;
    border: 6px solid #fff;
    border-radius: 24px;
  }
  &::before {
    left: -6px; top: -6px;
    border-right: none; border-bottom: none;
  }
  &::after {
    right: -6px; bottom: -6px;
    border-left: none; border-top: none;
  }
`;
const FlashButton = styled.button`
  position: absolute;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3B5CB8;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;

function ScanScreen({ onResult }) {
  const qrRef = useRef();
  const id = 'qr-reader-' + Math.random().toString(36).slice(2, 10);
  useEffect(() => {
    let qr;
    let timeout;
    function startQr() {
      if (!document.getElementById(id)) {
        timeout = setTimeout(startQr, 100);
        return;
      }
      qr = new Html5Qrcode(id);
      qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          onResult(decodedText);
          qr.stop();
        },
        (error) => {
          // Можно добавить вывод ошибки
        }
      ).catch((err) => {
        alert('Ошибка доступа к камере или инициализации QR: ' + err);
      });
    }
    startQr();
    return () => {
      if (qr) qr.stop().catch(() => {});
      if (timeout) clearTimeout(timeout);
    };
  }, [onResult, id]);
  return (
    <ScanScreenWrapper>
      <CameraView>
        <div id={id} ref={qrRef} style={{ width: 220, height: 220, background: 'transparent', borderRadius: 24, position: 'relative' }} />
        <img src={`${import.meta.env.BASE_URL || '/'}images/scan-frame.png`} alt="scan frame" style={{ position: 'absolute', top: '50%', left: '50%', width: 220, height: 220, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
      </CameraView>
    </ScanScreenWrapper>
  );
}

function App() {
  // Примерные координаты для карты
  const positionA = [55.751244, 37.618423];
  const positionB = [55.764857, 37.597656];
  const [activeTab, setActiveTab] = useState('home');
  const [qrResult, setQrResult] = useState(null);
  useEffect(() => {
    if (qrResult) {
      alert('QR: ' + qrResult);
      setQrResult(null);
    }
  }, [qrResult]);

  const postomats = [
    [56.835065, 60.789971],
    [56.840522, 60.727830],
    [56.844214, 60.700890],
    [56.838645, 60.607796],
  ];
  const base = import.meta.env.BASE_URL || '/';
  const postomatIcon = new L.Icon({
    iconUrl: `${base}images/postomat-marker.png`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const [scanIcon, setScanIcon] = useState(`${base}images/scan-white.png`);

  // Прозрачный фон body, #root и Wrapper только при активном сканере
  useEffect(() => {
    if (activeTab === 'scan') {
      document.body.style.setProperty('background', 'none', 'important');
      const root = document.getElementById('root');
      if (root) root.style.setProperty('background', 'none', 'important');
    } else {
      document.body.style.background = '';
      const root = document.getElementById('root');
      if (root) root.style.background = '';
    }
    return () => {
      document.body.style.background = '';
      const root = document.getElementById('root');
      if (root) root.style.background = '';
    };
  }, [activeTab]);

  // Проверка наличия scan-white.png, если нет — fallback на scan.png
  useEffect(() => {
    if (activeTab === 'scan') {
      const img = new window.Image();
      img.onload = () => setScanIcon(`${base}images/scan-white.png`);
      img.onerror = () => setScanIcon(`${base}images/scan.png`);
      img.src = `${base}images/scan-white.png`;
    }
  }, [activeTab, base]);

  return (
    <Wrapper transparent={activeTab === 'scan'} style={activeTab === 'scan' ? { background: 'none', backgroundColor: 'transparent' } : {}}>
      {activeTab === 'scan' && <ScanScreen onResult={text => { setQrResult(text); setActiveTab('home'); }} />}
      {activeTab === 'home' && (
        <>
          <Header>
            <Logo>
              <img src={`${base}images/logo.png`} alt="Логотип" />
            </Logo>
          </Header>
          <Greeting>
            Добрый день Екатерина,<br />
            <span>Что закажем сегодня?</span>
          </Greeting>
          <OrderCard>
            <OrderRow>
              <OrderImg>
                <img src={`${base}images/avatar.png`} alt="Аватар" />
              </OrderImg>
              <OrderInfo>
                <OrderTitle>Arduino набор</OrderTitle>
                <OrderDesc>Ваша посылка</OrderDesc>
              </OrderInfo>
              <svg width="24" height="24"><polyline points="8,6 16,12 8,18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </OrderRow>
            <OrderDetails>
              <span>📅 Среда, 21 мая</span>
              <span>🕒 11:00 – 12:00 Утра</span>
            </OrderDetails>
          </OrderCard>
          <SearchBarWrapper>
            <SearchBar placeholder="Поищем что-нибудь новое?" />
          </SearchBarWrapper>
          <MapBlock>
            <MapTitle>Ближайший постомат в 40 минутах от вас</MapTitle>
            <StyledMap>
              <MapContainer center={postomats[0]} zoom={12} style={{ height: '180px', width: '100%' }} scrollWheelZoom={false} dragging={false} zoomControl={false} doubleClickZoom={false} attributionControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {postomats.map((pos, idx) => (
                  <Marker key={idx} position={pos} icon={postomatIcon} />
                ))}
              </MapContainer>
            </StyledMap>
          </MapBlock>
        </>
      )}
      <BottomNav>
        <NavIcon active={activeTab === 'home'} onClick={() => setActiveTab('home')}>
          <img src={`${base}images/home.png`} alt="Домой" />
        </NavIcon>
        <NavIcon center active={activeTab === 'scan'} onClick={() => setActiveTab('scan')}>
          <img src={activeTab === 'scan' ? scanIcon : `${base}images/scan.png`} alt="Сканер" />
        </NavIcon>
        <NavIcon active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>
          <img src={`${base}images/chat.png`} alt="Чат" />
        </NavIcon>
      </BottomNav>
    </Wrapper>
  );
}

export default App;
