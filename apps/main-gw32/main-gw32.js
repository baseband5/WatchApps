
const STOR = require("Storage");

global.wOS = {
    ON_TIME: 10,
    BRIGHT : 0.5,
    FACEUP:true,
    VIBRATE:true,
    awake : true,
    time_left:10,
    ticker:undefined,
    settings:undefined,
    buzz: (v)=>{
        if (!wOS.VIBRATE) return;
        v = v? v : 100;
        if (v<=50){
            digitalPulse(wOS.BUZZPIN,true,v);
        } else {
            wOS.BUZZPIN.set();
            setTimeout(()=>{wOS.BUZZPIN.reset();},v);
        }
    },
    batV: () => {
        return  5.83*analogRead(wOS.BATVOLT);
    },
    isCharging:()=>{return wOS.BATPIN.read();},
    setLCDTimeout:(v)=>{wOS.ON_TIME=v<5?5:v;},
    setLCDBrightness:(v)=>{wOS.BRIGHT=v; wOS.brightness(v);},
    init:()=>{
        var s = STOR.readJSON("settings.json",1)||{ontime:10, bright:0.5, timezone:1,faceup:true,vibrate:true,steps:false,lowbright:0.3,nightbright:0.1,daystart:7,lowstart:19,nightstart:23};
        wOS.ON_TIME=s.ontime;
        wOS.time_left=s.ontime;
        wOS.BRIGHT=s.bright;
        wOS.FACEUP=s.faceup;
        wOS.VIBRATE=(typeof s.vibrate!='undefined')?s.vibrate:true;
        wOS.STEPS=(typeof s.steps!='undefined')?s.steps:false;
        wOS.settings=s;
        E.setTimeZone(s.timezone);
    },
    sleep:() => {
        wOS.awake = false;
        wOS.brightness(0);
        TC.stop();
        wOS.emit("lcdPower",false);
        g.flip(); //make sure finished with SPI before stopping it.
        g.lcd_sleep();
       // setTimeout(anom89,100);
    },
    bright:()=>{
        var hrs = Date().getHours();
        var ds = wOS.settings.daystart;
        var ls = wOS.settings.lowstart;
        var ns = wOS.settings.nightstart;
        var b = (hrs>=ds && hrs<ls)? wOS.BRIGHT : (hrs>=ls && hrs<ns) ? wOS.settings.lowbright : wOS.settings.nightbright;
        wOS.brightness(b);
    },
    wake:()=> {
        wOS.awake = true;
        wOS.time_left = wOS.ON_TIME;
        TC.start();
        g.lcd_wake();
        wOS.emit("lcdPower",true);
        wOS.bright();
        wOS.ticker = setInterval(wOS.tick,1000);
    },
    setLCDPower:(b)=>{
        if (b){
            if (wOS.awake) wOS.time_left = wOS.ON_TIME; else wOS.wake();
        } else 
            wOS.sleep();
    },
    isLCDOn:()=>{ return wOS.awake;},
    tick:()=>{
        wOS.time_left--;
        if (wOS.time_left<=0){
           if (wOS.ticker) wOS.ticker=clearInterval(wOS.ticker);
           wOS.emit("sleep",true);
           wOS.sleep();
        }
    }
};


wOS.BATPIN = D22;
wOS.BATVOLT = D31;
wOS.BUZZPIN = D32;

var wOSI2C = new I2C();
wOSI2C.setup({scl:D3,sda:47,bitrate:200000});

global.Bangle = wOS;

function watchBat(){
    setWatch(()=>{
      if(!wOS.awake) wOS.wake();
      wOS.emit("charging",wOS.isCharging());
  },wOS.BATPIN,{edge:"both",repeat:true,debounce:500});
}

wOS.init();
eval(STOR.read("lcd-gw32.js"));
var g = GC9A01();
g.setTheme((wOS.settings.theme)? wOS.settings.theme : {fg:0xffff,bg:0,fg2:0x07ff,bg2:0,fgH:0xFFFF,bgH:0x001F,dark:true});
wOS.bright();
//console.log("loaded lcd");
eval(STOR.read("it7259.js"));
TC.start();
//console.log("loaded touch");
eval(STOR.read("accel-gw32.js"));
ACCEL.init();
ACCEL.on("faceup",()=>{if (!wOS.awake) wOS.wake();});
//console.log("loaded accel");
wOS.ticker = setInterval(wOS.tick,1000);
wOS.POWER=wOS.isCharging();
watchBat();

if (STOR.read("alarm.boot.js")) eval(STOR.read("alarm.boot.js"));

E.getBattery = function (){
    var v = wOS.batV();
    v = v<3.7?3.7:v;
    return Math.floor((v-3.7)*200);
}

wOS.showLauncher = function(){load("launch-gw32.js");};
eval(STOR.read("menu-gw32.js"));
eval(STOR.read("prompt-gw32.js"));
eval(STOR.read("widgets-gw32.js"));
if (wOS.settings.gpsclient) 
    eval(STOR.read("gps.js"));
else {
    Bangle.setGPSPower = function(on){};
}

wOS.btnWatches = [
    setWatch(function() {if (wOS.awake) wOS.showLauncher(); else wOS.wake();}, BTN1, {repeat:1,edge:"falling"}),
  ];


