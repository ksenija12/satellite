$.getJSON("data.json").done( function(json) {
    if ((typeof json) != "object") {json = JSON.parse(json)};

    $("#corrections").attr("placeholder", `${json.corrections}`);
    $("#cells").attr("placeholder", `${json.cells}`);

    // функция распределения капсул

    function distributeCells() {
        
        json.cells.sort(function(a, b) {    // сортируем капсулы по уменьшению
            return b - a;
          });


        let main = [];
        let sec = [];
        let differ, difM, difS;
        let arr = json.cells;
        let delta = 0;
        let answer = {};

        
        for (let i = 0; i < json.corrections.length; i++) {     // список(массив) маневров с использованием первого двигателя
            
            differ = json.corrections[i];
            difM = arr.find(function(el){
                return el <= differ;
            });

            if (difM) {
                main.push(difM);
                arr.splice(arr.indexOf(difM),1);
            } else {
                main.push(0);
            };        
        }

        for (let i = 0; i < json.corrections.length; i++) { // список(массив) маневров с использованием второго двигателя
            differ = json.corrections[i] - main[i];
            difS = arr.find(function(el){
                return el <= differ*2;
            });
            
            if (difS) {
                sec.push(difS);                
                arr.splice(arr.indexOf(difS),1);
            } else {
                sec.push(0);
            };
        };

        
        delta = findDelta(main) + findDelta(sec)/2;     // итоговое полученное приращение скорости
        
        answer = {"main_thruster":main,"sec_thruster":sec,"delta_velocity":delta};
        console.log(JSON.stringify(answer));

        $(".answer__text").text(`${JSON.stringify(answer)}`);   //  изменения на странице
        return [main,sec,delta]
        
    };

    distributeCells();

    // функция подсчета итогового полученное приращение скорости

    function findDelta(arr) {
        return arr.reduce((acc, cur) => acc + cur);
    };


    //  изменения на странице

    $("#corrections, #cells").on("input", function(){
        $(this).val($(this).val().replace(/[^0-9,]/g, '').replace( /,,/g, ',' ));
    })
    
    $(".button").on("click", function() {

        if (($("#corrections").val() == "") || ($("#cells").val() == "")) {
            alert("Заполните, пожалуйста, поля")
        } else {
            $(".rocket").css({"left":"-200px","bottom":"-200px"});
            $(".rocket").css("transition", "none");

            if ($("#corrections").val().slice(0,1) == ",") {$("#corrections").val($("#corrections").val().slice(1))};
            if ($("#corrections").val().slice(-1) == ",") {$("#corrections").val($("#corrections").val().slice(0,-1))};
            json.corrections = $("#corrections").val().split(",").map(el => Number(el));

            if ($("#cells").val().slice(0,1) == ",") {$("#cells").val($("#cells").val().slice(1))};
            if ($("#cells").val().slice(-1) == ",") {$("#cells").val($("#cells").val().slice(0,-1))};
            json.cells = $("#cells").val().split(",").map(el => Number(el));

            let start = distributeCells();

            const pageWidth = document.documentElement.scrollWidth;
            const pageHeight = document.documentElement.scrollHeight;
            const diagon = Math.pow(Math.pow(pageWidth,2)+Math.pow(pageHeight,2),1/2);
            
            let w = 0;
            let h = 0;
            let n = 3;
            let l = 6;
            let time;
            for (let i = 0; i <= json.corrections.length; i++) {   
                time = diagon/(json.corrections.length+1)/n*10;
                
                $(".rocket").animate({"left":`${100+w}px`,"bottom":`${100+h}px`}, time, "linear", function(){
                    console.log(time)
                }) ;
            
                n += start[0][i] + (start[1][i] / 2);
                w += (pageWidth-100) / (json.corrections.length+1);
                h += (pageHeight-100) / (json.corrections.length+1);

            };
        };
    });



});


// 1. Для решения данной задачи изначально отсортирован список значений топливных капсул по уменьшению

// 2. Далее построен список(массив) маневров с использованием первого двигателя
//   (т.к. он позволяет получить прирост скорости равный значению используемой капсулы)

// 3. Следующим построен список(массив) маневров с использованием второго двигателя с
//    учетом использования первого для достижения максимально-возможного прироста скорости

// 4. На основании списков(массивов) маневров расчитано итоговое полученное приращение скорости