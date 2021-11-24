document.addEventListener("DOMContentLoaded", function(event) { 
    let seriesData = [];
    lineCharData(seriesData);
});


function changeROI(name,data){
    Highcharts.chart('container2', {
        title: {
            text: 'Nivel de Dióxido de Nitrogeno (Histórico)'
        },

        subtitle: {
            text: 'ROI: ' + name
        },

        yAxis: {
            title: {
                text: 'Niveles de Concentración de NO2 en mol/m^2 Lima'
            },
            min: 0,     
            max: 0.0004
        },

        xAxis: {
            type: 'datetime',
            labels: {
                format: '{value:%Y-%m-%e}'
            },
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                }
            }
        },

        series: [{
            name: 'NO2',
            data: data
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });
}

var Distname = "";
// Initial Map
var currDate = new Date();
var todayDate = currDate.getFullYear()+'-'+(currDate.getMonth()+1)+'-'+currDate.getDate();
var startDate = '2021-01-01';
var endDate = todayDate;

var lat = 0;
var lng = 0;

async function getMeasurements(lat, lng) {
    const msg = {
        lat: lat,
        lng: lng,
        startDate: startDate,
        endDate: endDate
    };
    socket.emit('userCoordinates', msg);
}


var slider = document.getElementById("timeSlider");
var labelSlider = document.getElementById("labelSlider");
var select = document.getElementById('Year');
var select2 = document.getElementById('Month');
var button = document.getElementById('button');
var loader = document.getElementById('spinLoader');
loader.style.display = "none";

labelSlider.innerHTML = slider.value;

slider.oninput = function() {
    labelSlider.innerHTML = this.value;
    if (slider.value == currDate.getFullYear()){
        startDate = '2021-01-01';
        endDate = todayDate;
    } else if (slider.value == '2018') {
        startDate = '2018-07-30';
        endDate = '2018-12-31';
    }  else {
        startDate = this.value + '-01-01';
        endDate = this.value + '-12-31';
    }
    getMeasurements(lat, lng)
	loader.style.display = "block";
}

var map = L.map('map-template').setView([-12.046374, -77.042793], 13)
var openstreet = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
openstreet.addTo(map);
var no2Map= L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');

var baseMaps = {
	"Map": openstreet,
};

var overlayMaps = {
	"NO2 layer": no2Map
};
L.control.layers(baseMaps, overlayMaps).addTo(map);

const socket = io();
var isAvailable = true;
var layerGroup = L.layerGroup().addTo(map);



var DateDict = {Start: '2021-10-01', End:'2021-10-15'}
console.log("cargando primera capa")
loader.style.display = "block";
socket.emit('Mapviz', DateDict)
select.disabled = true;
select2.disabled = true;
button.disabled = true;
slider.disabled = true;
isAvailable = false;


map.locate({enableHighAccuracy: true});


map.on('locationfound', e => {
    if (isAvailable) {

        layerGroup.clearLayers();
        map.closePopup();
        const coords = [e.latlng.lat, e.latlng.lng]
        lat = e.latlng.lat;
        lng = e.latlng.lng;
        const marker = L.marker(coords).addTo(map);
        marker.addTo(layerGroup);
        marker.bindPopup('Tu ubicación actual');
        map.addLayer(marker);
        getMeasurements(e.latlng.lat, e.latlng.lng);
        select.disabled = true;
        select2.disabled = true;
        button.disabled = true;
        slider.disabled = true;
        isAvailable = false;
	    loader.style.display = "block";
    }
});



map.on('click', function(e) {
    if (isAvailable) {
        layerGroup.clearLayers();
        map.closePopup();
        const coords = [e.latlng.lat, e.latlng.lng]
        lat = e.latlng.lat;
        lng = e.latlng.lng;
        const marker = L.marker(coords).addTo(map);
        marker.addTo(layerGroup);
        getMeasurements(e.latlng.lat, e.latlng.lng);
        select.disabled = true;
        select2.disabled = true;
        button.disabled = true;
        slider.disabled = true;
        isAvailable = false;
	    loader.style.display = "block";
    }
});

socket.on('markerInfo', (res) => {
    if (res.success){
        lineCharData(res.timeseries);
    }	
    select.disabled = false;
    select2.disabled = false;
    button.disabled = false;
    slider.disabled = false;
    isAvailable = true;
	loader.style.display = "none";
})


function Years() {
    var elm = document.getElementById('Year'),
    df = document.createDocumentFragment();
    var startDate = new Date("2018/7/30")
    var today = new Date();
    var loop = new Date(startDate);
    while(loop < today) {
  		var year = loop.getFullYear();        
        var optionLabel1 = year;
        var option = document.createElement('option');
        option.value = optionLabel1.toString()
        option.appendChild(document.createTextNode(optionLabel1));
        df.appendChild(option);
        let newDate = loop.setDate(loop.getDate() + 365);
        loop = new Date(newDate);
    }
    elm.appendChild(df);
}
Years();
var months = {0:"Ene",1:"Feb",2:"Mar",3:"Abr",
              4:"May",5:"Jun",6:"Jul",7:"Ago",
              8:"Sep",9:"Oct",10:"Nov",11:"Dic"}
var months2 = {0:"01",1:"02",2:"03",3:"04",
              4:"05",5:"06",6:"07",7:"08",
              8:"09",9:"10",10:"11",11:"00"}

function MonthInit() {
    var elm = document.getElementById('Month'),
    df = document.createDocumentFragment();
    for(let i = 6; i < 12; i++){
        var optionLabel1 = months[i];
        var option = document.createElement('option');
        option.value = optionLabel1.toString()
        option.appendChild(document.createTextNode(optionLabel1));
        df.appendChild(option);
        
    }
    elm.appendChild(df);
}
MonthInit();


function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
 }
 
function MonthSelect() {
    var elm = document.getElementById('Month'),
    df = document.createDocumentFragment();
    var elm2 = document.getElementById('Year');
    var yearSel = elm2.value
    var init_value = 0;
    var end__value = months.length;
    var date = new Date();
    var month = date.getMonth();   
    date = date.getFullYear();
    if(yearSel.toString() == "2018"){
        init_value = 6;
        end__value = 12;
    }
    else if(yearSel.toString() == date.toString()){
        init_value = 0;
        end__value = months2[month.toString()]-1;
    }
    else if(yearSel.toString != "2018" || yearSel.toString != date.toString()){
        init_value = 0;
        end__value = 12;
    }
    
    // using the function:
    removeOptions(elm);
    for(let i = init_value; i < end__value; i++){
        var optionLabel1 = months[i];
        var option = document.createElement('option');
        option.value = optionLabel1.toString()
        option.appendChild(document.createTextNode(optionLabel1));
        df.appendChild(option);
        
    }
    elm.appendChild(df);
}


function DateSel(){
    if(isAvailable){
        var nums = {"Ene":"01","Feb":"02","Mar":"03","Abr":"04",
                    "May":"05","Jun":"06","Jul":"07","Ago":"08",
                    "Sep":"09","0ct":"10","Nov":"11","Dic":"12"}

        var Year = document.getElementById('Year').value;
        var Month = document.getElementById('Month').value;
        var m = Month.toString()
        var StartDate = Year.toString() + '-' + nums[m] + '-' + "01"
        var Mdays = 0;
        if(m == "Ene" ||m == "Mar" ||m == "May" ||m == "Jul" ||m == "Ago" || m == "Oct" ||m == "Dic")
            Mdays = 31;
        else if(m == "Nov" || m == "Abr" || m == "Jun" ||m == "Sep")
            Mdays = 30;
        else if(m == "Feb")
            Mdays = 28;
        var EndDate = Year.toString() + '-' + nums[m] + '-' + Mdays.toString();
        var DateDict = {Start: StartDate, End:EndDate}
        console.log(DateDict)
        socket.emit('Mapviz', DateDict)
        select.disabled = true;
        select2.disabled = true;
        button.disabled = true;
        slider.disabled = true;
        isAvailable = false;
        loader.style.display = "block";    
    }
}
var colors = ['#D30000','#0018F9','#3BB143','#FFF200','#784B84','#FFFFFF',
              '#FC6600','#B200ED','#7C4700','#FA8072','#EFFD5F','#1C2951',
              '#01796F','#B47EDE','#E4CD05','#EC5578','#008ECC','#B660CD']

var ROIs = [[-77.04,-77.12,-77.01,-77.01,-76.99,-76.94,
             -77.06,-77.04,-77.04,-76.98,-77.02,-76.91,
             -77.04,-77.03,-76.96,-76.99,-77.00,-76.97],
            [-12.04,-12.02,-12.06,-12.18,-12.06,-12.04,
             -11.98,-12.10,-12.04,-12.09,-12.05,-12.00,
             -12.07,-11.90,-12.10,-11.98,-12.10,-12.04],
            ['Lima','Aeropuerto Jorge Chávez','Gamarra','Matellini','Mercado de frutas','Santa Anita',
             'Naranjal','San Isidro','T.Caqueta','T.Javier Prado','Centro de Lima','Huachipa',
             'Campo de Marte','Carabayllo','Embajada de EE.UU',
            'San Juan de Lurigancho','San Borja','Santa Anita']]

var rDict = {"-77.04,-12.04":'Lima',"-77.12,-12.02":'Aeropuerto Jorge Chávez',
             "-77.01,-12.06":'Gamarra',"-77.01,-12.18":'Matellini',
             "-76.99,-12.06":'Mercado de Frutas',"-76.94,-12.04":'Santa Anita_1',
             "-77.06,-11.98":'Naranjal',"-77.04,-12.10":'San Isidro',
             "-77.04,-12.04":'T.Caqueta',"-76.98,-12.09":'T.Javier Prado',
             "-77.02,-12.05":'Centro de Lima',"-76.91,-12.00":'Huachipa',
             "-77.04,-12.07":'Campo de Marte',"-77.03,-11.90":'Carabayllo',
             "-76.96,-12.10":'Embajada de EE.UU',"-76.99,-11.98":'San Juan de Lurigancho',
             "-77.00,-12.10":'San Borja',"-76.97,-12.04":'Santa Anita_2'}

function circleClick(e){
   if(isAvailable){
        console.log(e);
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        var coors = [lng.toFixed(2),lat.toFixed(2)];
        Distname = rDict[coors.toString()];
        console.log(coors.toString())
        console.log(Distname)
        var dd = {Name:Distname} 
        socket.emit('HistData',dd);
        select.disabled = true;
        select2.disabled = true;
        button.disabled = true;
        slider.disabled = true;
        isAvailable = false;
        loader.style.display = "block";  
   }
}
socket.on('Hist', (res) => {
    var dat = res.timeseries;
    changeROI(Distname,dat);
    select.disabled = false;
    select2.disabled = false;
    button.disabled = false;
    slider.disabled = false;
    isAvailable = true;
    loader.style.display = "none";
})


for(let i = 0; i <18; i++){
    var loc1 = L.circle([ROIs[1][i],ROIs[0][i]], {
        color: 'black',
        fillColor: 'black',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);
    loc1.on("click",circleClick);
    loc1.bindPopup(ROIs[2][i]);
}
socket.on('Link', (res) => {
    select.disabled = false;
    select2.disabled = false;
    button.disabled = false;
	slider.disabled = false;
	isAvailable = true;
   
 if (res.success){
        //map.eachLayer(function (layer) {
          //map.removeLayer(layer);
        //});
	map.removeLayer(no2Map);
        //L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        var link = res.Link;
        no2Map = L.tileLayer(link.toString()).addTo(map);
        //var baseMaps = {
        //    "Map": map,
        //}
    }
	loader.style.display = "none";
});


var lineCharData = async (seriesData) => {
    data = Object.values(seriesData);
    var max_val = 0;
    for(let i = 0; i < data.length; i++){
        if(max_val < data[i][1])
            max_val = data[i][1]
    }
    Highcharts.chart('container', {
        title: {
            text: 'Nivel de Dióxido de Nitrogeno (Marcador)'
        },
    
        subtitle: {
            text: 'Source: Google Earth Engine'
        },
    
        yAxis: {
            title: {
                text: 'Niveles de Concentración de NO2 en mol/m^2'
            },
            min: 0,     
            max: max_val + max_val*0.5
        },
    
        xAxis: {
            type: 'datetime',
            labels: {
                format: '{value:%Y-%m-%e}'
            },
        },
    
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
    
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                }
            }
        },
    
        series: [{
            name: 'NO2',
            data: seriesData
        }
        // ,
        // {
        //     name:'Permitted level by',
        //     data: max_Limit
        // }
    ],
    
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    
    });
}

/*Legend specific*/
var legend = L.control({ position: "topright" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>&micromol/m<sup>2</sup></h4>";
  div.innerHTML += '<i style="background: #FE6868"></i><span>200 - 175</span><br>';
  div.innerHTML += '<i style="background: #FEF768"></i><span>175 - 150</span><br>';
  div.innerHTML += '<i style="background: #7BC768"></i><span>150 - 125</span><br>';
  div.innerHTML += '<i style="background: #8AFFEC"></i><span>100 - 75</span><br>';
  div.innerHTML += '<i style="background: #BA8CBA"></i><span>75 - 50</span><br>';
  div.innerHTML += '<i style="background: #4F67FF"></i><span>50 - 25</span><br>';
  div.innerHTML += '<i style="background: #FFFFFF"></i><span>25 - 0</span><br>';
  
  

  return div;
};

legend.addTo(map);


/* 
socket.on('newUserCoordinates', (coords) => {
    console.log('New user is connected');
    const marker = L.marker([coords.lat + 0.001, coords.lng+ 0.001]);
    marker.bindPopup('Hello there!');
    map.addLayer(marker);
})
*/
