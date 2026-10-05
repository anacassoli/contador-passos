import { useState,useEffect,useRef } from 'react';
import {StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Linking,Platform,Alert,ActivityIndicator,} from 'react-native';
import { Feather,Ionicons } from '@expo/vector-icons';
import*as Location from 'expo-location';
import{Pedometer}from 'expo-sensors';

export default function App(){
//Estados de Localização (inicio dinamico, aguardando sinal GPS)
const[localizacao, setLocalizacao] = useState({
latitude:null,
longitude:null,
precisao:null,
rua:'Buscando sinal GPS...',
bairroCidade: 'Aguardando dados dos satélites...',
});
const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);

//Estados do Contador de Passos
const [passos, setPassos] = useState(0);
const[rastreando, setRastreado] =useState(false);
const[sensorStatus, setSensorStatus] = useState('GPS & Sensores Prontos');
const metaPassos =10000;

//Referencia para assinaturas ativas
const localizacaoSub = useRef(null);
const PedometerSub = useRef(null);
const ultimaPosicao= useRef(null);

//1. Obter Localização Atual  e Endereco com GPS Real
const obterLocalizacao  = async()=>{
setCarregandoLocalizacao(true);
try{
//Verfica se o GPS/Serviços de Localização estão ativos no dispositivo
const servicoAtivo = await Location.hasServicesEnabledAsync();
if(!servicoAtivo){
Alert.alert(
'GPS Desativado',
'Por favor, ative a localização/GPS nas configurações do seu celular para obter a posição real.'
);
}

const {status} = await Location.requestForegroundPermissionsAsync();
if(status !== 'granted'){
Alert.alert('Permissão Negada', 'Para obter a localização, é necessário conceder permissão de acesso à localização.'
);
setLocalizacao({prev} => ({...prev, rua:'Permissão de GPS Negada', bairroCidade:'Permissão Negada'}));
}}};
setCarregandoLocalizacao(false);
return;
}

const ultimaConhecida = await Location.getLastKnownPositionAsync();
if(ultimaConhecida && ultimaConhecida.coords){
const {latitude, longitude, accuracy} = ultimaConhecida.coords;
setLocalizacao(prev => ({...prev, latitude, longitude, precisao: Math.round(accuracy || 10), rua: prev.latitude === null ? 'Buscando sinal GPS...' : prev.rua, bairroCidade: prev.latitude === null ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : prev.bairroCidade}));
}

const 