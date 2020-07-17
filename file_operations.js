const {dialog} = require('electron').remote;
var fs = require('fs');

function deleting_duplicates(csv_data){

    console.log("Before Deleting: ")
    console.log(csv_data.length)

    var unique_set = new Set(csv_data)
    var unique_array = [...unique_set]

    console.log("After Deleting: ")
    console.log(unique_array.length)
    return unique_array
}

function deleting_duplicates_for_comparison(csv_data){

    console.log("Before Deleting: ")
    console.log(csv_data.length)

    // First removal 
    for (let i = 0; i < csv_data.length; i++) {
        outer_element = csv_data[i];
        for (let j = i+1; j < csv_data.length; j++) {
            inner_element = csv_data[j];
            // for(const key in inner_element) {
            temp1 = outer_element.replace(/\s+/g, '')
            temp2 = inner_element.replace(/\s+/g, '')
            if(temp1.localeCompare(temp2) == 0 ){
                // if (key != "TYPE"){
                console.log(outer_element)
                csv_data.splice(j, 1)
                // }
            }
            // }
        }
    }

    // Second time removal if something is missed
    for (let i = 0; i < csv_data.length; i++) {
        outer_element = csv_data[i];
        for (let j = i+1; j < csv_data.length; j++) {
            inner_element = csv_data[j];
            // for(const key in inner_element) {
            temp1 = outer_element.replace(/\s+/g, '')
            temp2 = inner_element.replace(/\s+/g, '')
            if(temp1.localeCompare(temp2) == 0 ){
                // if (key != "TYPE"){
                console.log(outer_element)
                csv_data.splice(j, 1)
                // break
                // }
            }
            // }
        }
    }

    console.log("After Deleting: ")
    console.log(csv_data.length)
    return csv_data
}

function getting_unique_elements(csv_data1, csv_data2){

    console.log(csv_data1.length)
    console.log(csv_data2.length)

    var new_array = []

    filtered_data1 = deleting_duplicates_for_comparison(csv_data1)
    filtered_data2 = deleting_duplicates_for_comparison(csv_data2)

    // iteration_count_data2 = 0

    // for (let index = 0; index < filtered_data1.length; index++) {
    //     const outer_element = filtered_data1[index];
    //     flag = false
    //     for (let j = 0; j < filtered_data2.length; j++) {
    //         const inner_element = filtered_data2[j];
    //         temp1 = outer_element.replace(/\s+/g, '')
    //         temp2 = inner_element.replace(/\s+/g, '')
    //         if(temp1.localeCompare(temp2) == 0 ){
    //             flag = true
    //             break
    //         }
    //     }
    //     if(flag == false){
    //         new_array.push(outer_element)
    //     }
    // }

    for (let index = 0; index < filtered_data2.length; index++) {
        const outer_element = filtered_data2[index];
        flag = false
        for (let j = 0; j < filtered_data1.length; j++) {
            const inner_element = filtered_data1[j];
            temp1 = outer_element.replace(/\s+/g, '')
            temp2 = inner_element.replace(/\s+/g, '')
            if(temp1.localeCompare(temp2) == 0 ){
                flag = true
                break
            }
        }
        if(flag == false){
            new_array.push(outer_element)
        }
    }
    console.log("FUNCTION 2 RESULT: ")    
    console.log("NEW UNIQE ELEMENTS ARE: ")
    console.log(new_array)

    return new_array
}

module.exports = {
    deleting_duplicates,
    getting_unique_elements,
}


    // keys = Object.keys(csv_data[0])
    // // First removal 
    // for (let i = 0; i < csv_data.length; i++) {
    //     outer_element = csv_data[i];
    //     for (let j = i+1; j < csv_data.length; j++) {
    //         inner_element = csv_data[j];
    //         // for(const key in inner_element) {
    //         temp1 = outer_element[keys[0]].replace(/\s+/g, '')
    //         temp2 = inner_element[keys[0]].replace(/\s+/g, '')
    //         if(temp1.localeCompare(temp2) == 0 ){
    //             // if (key != "TYPE"){
    //             console.log(outer_element[keys[0]])
    //             csv_data.splice(j, 1)
    //             // }
    //         }
    //         // }
    //     }
    // }

    // // Second time removal if something is missed
    // for (let i = 0; i < csv_data.length; i++) {
    //     outer_element = csv_data[i];
    //     for (let j = i+1; j < csv_data.length; j++) {
    //         inner_element = csv_data[j];
    //         // for(const key in inner_element) {
    //         temp1 = outer_element[keys[0]].replace(/\s+/g, '')
    //         temp2 = inner_element[keys[0]].replace(/\s+/g, '')
    //         if(temp1.localeCompare(temp2) == 0 ){
    //             // if (key != "TYPE"){
    //             console.log(outer_element[keys[0]])
    //             csv_data.splice(j, 1)
    //             // break
    //             // }
    //         }
    //         // }
    //     }
    // }
