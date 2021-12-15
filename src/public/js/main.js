// Inicializacion del gráfico del marcador
document.addEventListener("DOMContentLoaded", function(event) { 
    let seriesData = [];
    refreshMarkerChart(seriesData);
});
document.getElementById('Warn1').style.display="none";
document.getElementById('Warn2').style.display="none";
// Inicialización de variables
var Distname = "";
var currDate = new Date();
var todayDate = currDate.getFullYear()+'-'+(currDate.getMonth()+1)+'-'+currDate.getDate();
var startDate = '2021-01-01';
var endDate = todayDate;
var lat = 0;
var lng = 0;
const socket = io();
var markerYear = "2021";
var isMarkerAvailable = true;
var isInterestLocationAvailable = true;

// Inicialización del mapa
var map = L.map('map-template').setView([-12.046374, -77.042793], 13);

var layerGroup = L.layerGroup().addTo(map);

var select = document.getElementById('Year');
var select2 = document.getElementById('Month');
var button = document.getElementById('button');
var loader = document.getElementById('spinLoader');
showLoader(false);

var OP_slider = document.getElementById("OpacitySlider");
var OP_Label = document.getElementById("OpacityLabel");
var opacity = 0.5;

OP_Label.innerHTML = (OP_slider.value).toString() + "%";
OP_slider.oninput = function(){
    OP_Label.innerHTML = (OP_slider.value).toString() + "%";
    opacity = (OP_slider.value/100).toFixed(2);
}

// Inicialización de controlador de capas
var openstreet = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
openstreet.addTo(map);
var no2Map= L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
var baseMaps = {
	"Map": openstreet,
};
var overlayMaps = {
	"NO2 layer": no2Map
};
LayerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

var DateDict = {Start: '2018-07-01', End:'2018-07-31'}
console.log("cargando primera capa")
showLoader(true);
socket.emit('Mapviz', DateDict)

/*  Funciones secundarias  */

function clearLayers() {
    layerGroup.clearLayers();
    map.closePopup();
}

function showLoader(enable){
    if (enable)
        loader.style.display = "block";
    else 
        loader.style.display = "none";
}

/*  Funciones del Marcador  */

// Funcion que pide las mediciones al servidor
async function requestMeasurements(lat, lng) {
    const msg = {
        lat: lat,
        lng: lng,
        startDate: startDate,
        endDate: endDate
    };
    socket.emit('userCoordinates', msg);
}

// Solicitud de ubicacion del usuario
map.locate({enableHighAccuracy: true});
map.on('locationfound', e => {
    if (isMarkerAvailable) {
        clearLayers();
        let coords = [e.latlng.lat, e.latlng.lng]
        lat = coords[0]; lng = coords[1];
        const marker = L.marker(coords).addTo(map);
        marker.addTo(layerGroup);
        marker.bindPopup("Ubicación actual estimada <br> <b>Lon: </b>" + lng.toFixed(2) + "<br> <b>Lat: </b>" + lat.toFixed(2)).openPopup();
        requestMeasurements(e.latlng.lat, e.latlng.lng);
        isMarkerAvailable = false;
	    showLoader(true);
    }
});

// 
map.on('click', function(e) {
    if (isMarkerAvailable) {
        clearLayers();
        const coords = [e.latlng.lat, e.latlng.lng]
        lat = coords[0]; lng = coords[1];
        const marker = L.marker(coords).addTo(map);
        marker.addTo(layerGroup);
        marker.bindPopup("<b>Lon: </b>" + lng.toFixed(2) +" <br> <b>Lat: </b>" + lat.toFixed(2)).openPopup();
        requestMeasurements(e.latlng.lat, e.latlng.lng);
        isMarkerAvailable = false;
	    showLoader(true);
    }
});

function changeMarkerYear() {
    let yearSelector = document.getElementById('markerYearSelector');
    markerYear = yearSelector.value;

    if (markerYear == (currDate.getFullYear()).toString()){
        startDate = '2021-01-01';
        endDate = todayDate;
    } else if (markerYear == "2018") {
        startDate = '2018-07-30';
        endDate = '2018-12-31';
    }  else {
        startDate = markerYear + '-01-01';
        endDate = markerYear + '-12-31';
    }
    requestMeasurements(lat, lng)
	showLoader(true);
}

// Funcion que se activa cuando el servidor proporciona las mediciones solicitidas
socket.on('markerInfo', (res) => {
    refreshMarkerChart(res.timeseries);
    isMarkerAvailable = true;
	showLoader(false);
})

function Years(stardate, endDate,year_id) {
    var elm = document.getElementById(year_id),
    df = document.createDocumentFragment();

    
    var loop = stardate;
    while(loop.getFullYear() < (endDate.getFullYear() + 1)) {
        var year = loop.getFullYear();        
        var optionLabel1 = year;
        var option = document.createElement('option');
        option.value = optionLabel1.toString()
        option.appendChild(document.createTextNode(optionLabel1));
        df.appendChild(option);
        let newDate = loop.setYear(loop.getFullYear() + 1);
        loop = new Date(newDate);
    }
    elm.appendChild(df);
}
function Years2() {
    var elm = document.getElementById('startYear'),
    df = document.createDocumentFragment();
    var startDate = new Date("2018/07/01")
    var today = currDate;
    var loop = new Date(startDate);
    while(loop.getFullYear() < (today.getFullYear() )) {
        var year = loop.getFullYear();        
        var optionLabel1 = year;
        var option = document.createElement('option');
        option.value = optionLabel1.toString()
        option.appendChild(document.createTextNode(optionLabel1));
        df.appendChild(option);
        let newDate = loop.setYear(loop.getFullYear() + 1);
        loop = new Date(newDate);
    }
    elm.appendChild(df);

    elm = document.getElementById('endYear'),
    loop = new Date('2019/01/01');
    while(loop.getFullYear() < (today.getFullYear() + 1)) {
        var year = loop.getFullYear();        
        var optionLabel1 = year;
        var option = document.createElement('option');
        option.value = optionLabel1.toString()
        option.appendChild(document.createTextNode(optionLabel1));
        df.appendChild(option);
        let newDate = loop.setYear(loop.getFullYear() + 1);
        loop = new Date(newDate);
    }
    elm.appendChild(df);



}
let tempdate = new Date("2018/07/01");
Years(tempdate, currDate, 'Year');
Years2();

var months = {0:"Ene",1:"Feb",2:"Mar",3:"Abr",
              4:"May",5:"Jun",6:"Jul",7:"Ago",
              8:"Sep",9:"Oct",10:"Nov",11:"Dic"}
var months2 = {"1":1,"2":2,"3":3,"4":4,
               "5":5,"6":6,"7":7,"8":8,
               "9":9,"10":10,"11":11,"12":12}

function MonthInit(month_id) {
    var elm = document.getElementById(month_id),
    df = document.createDocumentFragment();
    let init_val = 0;
    let end_val = 12;
    if(month_id == 'startMonth' || month_id == 'Month'){
        init_val = 6;
    }
    else{
        init_val = 0;
    }
    console.log(end_val)
    for(let i = init_val; i < end_val; i++){
        var optionLabel1 = months[i];
        var option = document.createElement('option');
        option.value = optionLabel1.toString()
        option.appendChild(document.createTextNode(optionLabel1));
        df.appendChild(option);
        
    }
    elm.appendChild(df);
}

MonthInit('Month');
MonthInit('startMonth');
MonthInit('endMonth');

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
}

function MonthSelect(id_month, id_year, id_warn) {
    var elm = document.getElementById(id_month),
    df = document.createDocumentFragment();
    var elm2 = document.getElementById(id_year);
    if (id_year == 'startYear') {
        let temp = parseInt(elm2.value) + 1
        let temp1 = new Date (temp.toString() +"/01/01")
        removeOptions(document.getElementById('endYear'));
        console.log(temp1)
        console.log(currDate)
        Years( temp1, currDate, 'endYear');
    } else if (id_year == 'endYear') {
        removeOptions(document.getElementById('startYear'));
        let temp = parseInt(elm2.value) - 1
        let temp1 = new Date ("2018/07/01")
        let temp2 = new Date (temp.toString() +"/01/01")
        Years( temp1, temp2, 'startYear');
    }
    var yearSel = elm2.value
    var init_value = 0;
    var end__value = months.length;
    var date = currDate;
    var month = date.getMonth();
    date = date.getFullYear();
    

    if(yearSel.toString() == "2018"){
        init_value = 6;
        end__value = 12;
        if(document.getElementById(id_warn).style.display == "block"){
            document.getElementById(id_warn).style.display = "none";
        }
    }
    else if(yearSel.toString() == date.toString()){
        init_value = 0;
        end__value = months2[month.toString()];
        console.log(month.toString());
        if(month.toString() == 0){
            if(document.getElementById(id_warn).style.display == "none"){
                document.getElementById(id_warn).style.display = "block";
            }
            console.log("The satelitte has not recorded the data for this month")
        }
    }
    else if(yearSel.toString != "2018" || yearSel.toString != date.toString()){
        init_value = 0;
        end__value = 12;
        if(document.getElementById(id_warn).style.display == "block"){
            document.getElementById(id_warn).style.display = "none";
        }
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

    var nums = {"Ene":"01","Feb":"02","Mar":"03","Abr":"04",
                "May":"05","Jun":"06","Jul":"07","Ago":"08",
                "Sep":"09","Oct":"10","Nov":"11","Dic":"12"}

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

    socket.emit('Mapviz', DateDict)

    showLoader(true);   
    
}

function DateSel2(){

    var nums = {"Ene":"01","Feb":"02","Mar":"03","Abr":"04",
                "May":"05","Jun":"06","Jul":"07","Ago":"08",
                "Sep":"09","Oct":"10","Nov":"11","Dic":"12"}

    var Year1 = document.getElementById('startYear').value;
    var Month1 = document.getElementById('startMonth').value;
    var m = Month1.toString()
    var StartDate = Year1.toString() + '-' + nums[m] + '-' + "01"

    var Year2 = document.getElementById('endYear').value;
    var Month2 = document.getElementById('endMonth').value;
    m = Month2.toString()
    var Mdays = 0;
    if(m == "Ene" ||m == "Mar" ||m == "May" ||m == "Jul" ||m == "Ago" || m == "Oct" ||m == "Dic")
        Mdays = 31;
    else if(m == "Nov" || m == "Abr" || m == "Jun" ||m == "Sep")
        Mdays = 30;
    else if(m == "Feb")
        Mdays = 28;
    var EndDate = Year2.toString() + '-' + nums[m] + '-' + Mdays.toString();
    
    startDate = StartDate;
    endDate = EndDate;
    console.log(startDate);
    console.log(endDate);
    requestMeasurements(lat, lng);
    isMarkerAvailable = false;
    showLoader(true);
    
}

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
   if(isInterestLocationAvailable){
        console.log(e);
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        var coors = [lng.toFixed(2),lat.toFixed(2)];
        Distname = rDict[coors.toString()];
        console.log(coors.toString())
        console.log(Distname)
        var dd = {Name:Distname} 
        socket.emit('HistData',dd);
        isInterestLocationAvailable = false;
   }
}
socket.on('Hist', (res) => {
    refreshROIChart(res.timeseries)
    isInterestLocationAvailable = true;
})

function refreshROIChart(timeseries) {
    let _title = "Nivel de Dióxido de Nitrogeno (Histórico)";
    let _subtitle = "ROI: " + Distname;
    let yTitle = "Niveles de Concentración de NO2 en mol/m^2 Lima";
    let yScale = {min: 0,max: 0.0004};
    let serie = {name:'NO2', data: timeseries};
    createChart('container2', _title, _subtitle, yTitle, yScale,serie);
}
function refreshMarkerChart(timeseries) {
    let _title = "Nivel de Dióxido de Nitrogeno (Marcador)";
    let _subtitle = markerYear;
    let yTitle = "Niveles de Concentración de NO2 en mol/m^2";
    let yScale = {min: 0,max: 0.0004};
    let serie = {name:'NO2', data: timeseries};
    createChart('container', _title, _subtitle, yTitle, yScale,serie);
}
var ROI_18 = L.layerGroup(); 
for(let i = 0; i <18; i++){
    var loc1 = L.circle([ROIs[1][i],ROIs[0][i]], {
        color: 'black',
        fillColor: 'black',
        fillOpacity: 0.5,
        radius: 500
    });
    loc1.addTo(ROI_18);
    loc1.on("click",circleClick);
    loc1.bindPopup(ROIs[2][i]);
}
ROI_18.addTo(map);
LayerControl.addOverlay(ROI_18,"NO2 lugares de interés");

socket.on('Link', (res) => {
    var Month = (document.getElementById('Month')).value;
    var Year = (document.getElementById('Year')).value;
    var label = "Capa NO2: "+ Year.toString() + " " + Month.toString();

    LayerControl.removeLayer(no2Map);
    map.removeLayer(no2Map);
    var link = res.Link;
    no2Map = L.tileLayer(link.toString(),{
        attribution: '&copy; <a href="https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S5P_OFFL_L3_NO2?hl=en">Google Earth Engine</a> contributors',
        opacity: opacity
    }).addTo(map);
    LayerControl.addOverlay(no2Map,label);
	showLoader(false)
});
/*Legend specific*/
var legend = L.control({ position: "topright" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>&micromol/m<sup>2</sup></h4>";
  div.innerHTML += '<i style="background: #FE6868"></i><span>200 - 150</span><br>';
  div.innerHTML += '<i style="background: #FEF768"></i><span>150 - 100</span><br>';
  div.innerHTML += '<i style="background: #7BC768"></i><span>100 - 50</span><br>';
  div.innerHTML += '<i style="background: #4F67FF"></i><span>50 - 0</span><br>';
  div.innerHTML += '<span>Sin color-No registrado</span><br>';
  return div;
};

legend.addTo(map);


/*
select.disabled = true;
select2.disabled = true;
button.disabled = true;
slider.disabled = true;
*/


function createChart(containerId, _title, _subtitle, yTitle, yScale,serie) {
    Highcharts.chart(containerId, {
        chart: {
            zoomType: 'x'
        },  
        title: {
            text: _title
        },
        subtitle: {
            text: _subtitle
        },
        yAxis: {
            title: {
                text: yTitle
            },
            min: yScale.min,     
            max: yScale.max
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
        series: [serie],
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