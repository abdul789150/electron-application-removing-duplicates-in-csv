const {dialog} = require('electron').remote;
const {shell} = require('electron');
var fs = require('fs');
var file_operation = require('./file_operations')
const csv = require('csv-parser')
var excel = require('excel4node')
const readXlsxFile = require('read-excel-file/node');
const { getGlobal, app } = require('electron').remote;
const ProgressBar = getGlobal('ProgressBar');
const pap_parse = require('papaparse')
// const {openExternal} = require('shell')
var isMac = process.platform === "darwin";
// console.log(isMac)

var csv_filtered_data = []
var csv_filtered_data_comp = []


// For First function
function readFromFile(file) {
    return new Promise((resolve, reject) => {
        var results = []
        fs.createReadStream(file)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                final_array = []
                keys = Object.keys(results[0])
                if ("AUTHOR" in results[0]){
                    merge_values = []
                    results.forEach(element => {
                        // console.log(element[keys[1]])
                        if(element[keys[1]]){
                            merge_values.push(element[keys[1]])
                        }
                    });
                    results.forEach(element => {
                        final_array.push(element[keys[0]])
                    });
                    merge_values.forEach(element => {
                        final_array.push(element)
                    });
    
                    resolve(final_array)
                }else{
                    keys = Object.keys(results[0])
                    results.forEach(element => {
                        final_array.push(element[keys[0]])
                    });
                    // console.log(final_array)
                    resolve(final_array)
                }

            }
        );
    });
}

// For Second Function
function readFromExcelFile(file){
    return new Promise((resolve, reject) => {
        var results = [];
        readXlsxFile(file).then((rows) => {
            rows.forEach(element => {
                element.forEach(inner => {
                    results.push(inner)
                })
            });
            resolve(results)
        })
    })
}

//////////////////////////////////////////////////////////////////////////
////////
///////                 FIRST FUNCTION SECTION
//////
//////////////////////////////////////////////////////////////////////////

document.getElementById('select-file').addEventListener('click', async function(){
    console.log("In the function")
    options = {
        properties:['multiSelections', 'openFile'],
        filters: [
            { name: 'csv files', extensions: ['csv'] },
        ]
    }

    var file_path = dialog.showOpenDialogSync(options)
    console.log(file_path)
    if(file_path === undefined){
        console.log("No File is selected, Please Select a File!")
    }else{
        // Progress bar
        var progressBar = new ProgressBar({
            text: 'Working on selected files',
            detail: 'Please Wait...',
            options: {
                closeOnComplete: true
            },
            style: { // the keys are all elements of the progress bar
                text: { // pair of CSSS properties/values
                    'font-weight': 'bold',
                    'color': '#3F51B5'
                },
                detail: {
                    'color': '#3F51B5'
                }
            },
            browserWindow: {
                webPreferences: {
                    nodeIntegration: true
                }
            }
        });
        progressBar
        .on('completed', function() {
            console.info(`completed...`);
            progressBar.detail = 'Task completed.';
            progressBar = null
            let options  = {
                type: 'info',
                buttons: ["Save data", "Cancel"],
                message: "Success",
                detail: "All files have been merged and duplicate entries have been deleted.",
                title: "File Merging",
                cancelId: 0, 
                noLink: false, 
                normalizeAccessKeys: false,
            }
            response = dialog.showMessageBoxSync(options)
            if(response == 0){
                file_saving()
            }
        })
        .on('aborted', function() {
            console.info(`aborted...`);
        });
        // working
        promises = []
        for (let index = 0; index < file_path.length; index++) {
            const element = file_path[index];
            promises.push(readFromFile(element))
        }
        
        Promise.all(promises).then(result => {
            objects_array = []
            result.forEach(element => {
                for (let index = 0; index < element.length; index++) {
                    const element1 = element[index];
                    objects_array.push(element1)                    
                }

            });
            // keys = Object.keys(objects_array[0])
            // console.log(keys)
            // merge_values = []
            // objects_array.forEach(element => {
            //     // console.log(element["AUTHOR"])
            //     if(element["AUTHOR"]){
            //         merge_values.push(element["AUTHOR"])
            //         delete element["AUTHOR"]
            //         delete element["ASIN/ISBN"]
            //         delete element["TYPE"]
            //     }
            // });
            // console.log("Final array before merging: ")
            // console.log(objects_array)
            // final_array = []
            // objects_array.forEach(element => {
            //     final_array.push(element[keys[0]])
            //     // i = i+1
            // });
            // merge_values.forEach(element => {
            //     final_array.push(element)
            // });

            // i=1
            // console.log(i)
            // console.log("Final array is before any function: ")
            // console.log(objects_array[240])
            // console.log("Final array legnth before usage: " + objects_array.length)
            try {
                csv_filtered_data = file_operation.deleting_duplicates(objects_array)
                progressBar.setCompleted();
                                
            } catch (error) {
                let options  = {
                    type: 'error',
                    buttons: ["Close"],
                    message: "Error",
                    detail: "Error has been occured, please try again!.",
                    title: "File Merging",
                    cancelId: 0, 
                    noLink: false, 
                    normalizeAccessKeys: false,
                }
                dialog.showMessageBoxSync(options)
            }

        });
    }
    
})

function file_saving(){
    // console.log("Size of filtered data is: " + csv_filtered_data.length)
    // console.log(csv_filtered_data)
    options = {
        title: "Save File",
        defaultPath: "file.xlsx",
        buttonLabel: "Save File",
        filters: [{name:"excel files", extensions:['xlsx']}]
    }
    saving_path = dialog.showSaveDialogSync(options);
    if(saving_path === undefined){
        console.log("No File is selected, Please Select a File!")
        let options  = {
            type: 'error',
            buttons: ["Try again", "Cancel"],
            message: "File Saving Error",
            detail: "Destination for saving the file is not selected",
            title: "Error",
            cancelId: 0,
            noLink: false, 
            normalizeAccessKeys: false,
        }
        response = dialog.showMessageBoxSync(options)
        if (response == 0){
            file_saving()
        }
    }else{
        extractAsExcel(saving_path)
    }
}


function extractAsExcel(path){
    
    var workbook = new excel.Workbook()
    var worksheet = workbook.addWorksheet('Sheet 1')
    var worksheet2 = workbook.addWorksheet('Sheet 2')

    var style = workbook.createStyle({
        font:{
            size: 10,
        }
    })

    i = 1
    // j = 1
    // for (const key in csv_filtered_data[0]) {
    //     worksheet.cell(i,j).string(key).style(style)
    //     j++
    // }
    // i = 2
    for (let index = 0; index < csv_filtered_data.length; index++) {
        const element = csv_filtered_data[index];
        j = 1
        // for (const key in element) {
        const value = element;
        worksheet.cell(i,j).string(value).style(style)
            // j++
        // }
        i = i+1
    }
    workbook.write(path)

    let options  = {
        type: 'info',
        buttons: ["Close"],
        message: "Success",
        detail: "All data is saved in the File.",
        title: "File Saved",
        cancelId: 0, 
        noLink: false, 
        normalizeAccessKeys: false,
    }
    dialog.showMessageBoxSync(options)
    console.log("Data is saved!")
}

//////////////////////////////////////////////////////////////////////////
////////
///////                END OF FIRST FUNCTION SECTION
//////
//////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////
////////
///////                SECOND FUNCTION SECTION
//////
//////////////////////////////////////////////////////////////////////////

var first_file_csv_data = []
var second_file_csv_data = []

function fist_file_selection(){
    options = {
        properties:['openFile'],
        filters: [
            { name: 'excel files', extensions: ['xlsx'] },
        ]
    }
    var file_path = dialog.showOpenDialogSync(options)
    console.log(file_path)
    if(file_path === undefined){
        console.log("No File is selected, Please Select a File!")
        let options  = {
            type: 'error',
            buttons: ["Ok"],
            message: "File Selection Error",
            detail: "No File has been selected, Please select a file",
            title: "Error",
            cancelId: 0,
            noLink: false, 
            normalizeAccessKeys: false,
        }
        dialog.showMessageBoxSync(options)
    }else{
        // Progress bar
        var progressBar = new ProgressBar({
            text: 'Reading data from file...',
            detail: 'Please Wait...',
            options: {
                closeOnComplete: true
            },
            style: { // the keys are all elements of the progress bar
                text: { // pair of CSSS properties/values
                    'font-weight': 'bold',
                    'color': '#3F51B5'
                },
                detail: {
                    'color': '#3F51B5'
                }
            },
            browserWindow: {
                webPreferences: {
                    nodeIntegration: true
                }
            }
        });
        progressBar
        .on('completed', function() {
            console.info(`completed...`);
            progressBar.detail = 'Task completed. Exiting...';
            progressBar = null
            show_dialog()
        })
        .on('aborted', function() {
            console.info(`aborted...`);
        });
        // working

        promises = []
        for (let index = 0; index < file_path.length; index++) {
            const element = file_path[index];
            promises.push(readFromExcelFile(element))
        }
        
        Promise.all(promises).then(result => {
            result.forEach(element => {
                element.forEach(inner=>{
                    first_file_csv_data.push(inner) 
                })
            }); 
            console.log("Done reading data: ")
            // console.log(first_file_csv_data)
            // show_dialog()
            progressBar.setCompleted();
        })

    }
    
}

function second_file_selection(){
    options = {
        properties:['openFile'],
        filters: [
            { name: 'excel files', extensions: ['xlsx'] },
        ]
    }
    var file_path = dialog.showOpenDialogSync(options)
    console.log(file_path)
    if(file_path === undefined){
        console.log("No File is selected, Please Select a File!")
        let options  = {
            type: 'error',
            buttons: ["Ok"],
            message: "File Selection Error",
            detail: "No File has been selected, Please select a file",
            title: "Error",
            cancelId: 0,
            noLink: false, 
            normalizeAccessKeys: false,
        }
        dialog.showMessageBoxSync(options)
    }else{
        // Progress bar
        var progressBar = new ProgressBar({
            text: 'Reading data from file...',
            detail: 'Please Wait...',
            options: {
                closeOnComplete: true
            },
            style: { // the keys are all elements of the progress bar
                text: { // pair of CSSS properties/values
                    'font-weight': 'bold',
                    'color': '#3F51B5'
                },
                detail: {
                    'color': '#3F51B5'
                }
            },
            browserWindow: {
                webPreferences: {
                    nodeIntegration: true
                }
            }
        });
        progressBar
        .on('completed', function() {
            console.info(`completed...`);
            progressBar.detail = 'Task completed. Exiting...';
            progressBar = null
            show_dialog()
        })
        .on('aborted', function() {
            console.info(`aborted...`);
        });
        // working
        promises = []
        for (let index = 0; index < file_path.length; index++) {
            const element = file_path[index];
            promises.push(readFromExcelFile(element))
        }
        
        Promise.all(promises).then(result => {
            result.forEach(element => {
                element.forEach(inner=>{
                    second_file_csv_data.push(inner) 
                })

            }); 
            console.log("Done reading data: ")
            // console.log(second_file_csv_data)
            progressBar.setCompleted();
        })
    }
    
}

function start_comparison(){
    try {
        // Progress bar
        var progressBar = new ProgressBar({
            text: 'Working on data...',
            detail: 'Please Wait...',
            options: {
                closeOnComplete: true
            },
            style: { // the keys are all elements of the progress bar
                text: { // pair of CSSS properties/values
                    'font-weight': 'bold',
                    'color': '#3F51B5'
                },
                detail: {
                    'color': '#3F51B5'
                }
            },
            browserWindow: {
                webPreferences: {
                    nodeIntegration: true
                }
            }
        });
        progressBar
        .on('completed', function() {
            console.info(`completed...`);
            progressBar.detail = 'Task completed, found '+csv_filtered_data_comp.length+" unique entries!";
            progressBar = null
            let options  = {
                type: 'info',
                buttons: ["Save data", "Cancel"],
                message: "Success",
                detail: "Please Save the data by selecting an appropriate destination.",
                title: "File Comparison",
                cancelId: 0, 
                noLink: false, 
                normalizeAccessKeys: false,
            }
            response = dialog.showMessageBoxSync(options)
            if(response == 0){
                file_saving_comp()
            }
        })
        .on('aborted', function() {
            console.info(`aborted...`);
        });
        // working
        csv_filtered_data_comp = file_operation.getting_unique_elements(first_file_csv_data, second_file_csv_data)    
        progressBar.setCompleted();
    } catch (error) {
        let options  = {
            type: 'error',
            buttons: ["Close"],
            message: "Error",
            detail: "Error has been occured, please try again!.",
            title: "File Comparison",
            cancelId: 0, 
            noLink: false, 
            normalizeAccessKeys: false,
        }
        dialog.showMessageBoxSync(options)
        show_dialog()
    }
}

function file_saving_comp(){
    // console.log("Size of filtered data is: " + csv_filtered_data.length)
    // console.log(csv_filtered_data)
    options = {
        title: "Save File",
        defaultPath: "file.xlsx",
        buttonLabel: "Save File",
        filters: [{name:"excel files", extensions:['xlsx']}]
    }
    saving_path = dialog.showSaveDialogSync(options);
    if(saving_path === undefined){
        console.log("No File is selected, Please Select a File!")
        let options  = {
            type: 'error',
            buttons: ["Try again", "Cancel"],
            message: "File Saving Error",
            detail: "Destination for saving the file is not selected",
            title: "Error",
            cancelId: 0,
            noLink: false, 
            normalizeAccessKeys: false,
        }
        response = dialog.showMessageBoxSync(options)
        if (response == 0){
            file_saving()
        }
    }else{
        extractAsExcelComparison(saving_path)
    }
}

function extractAsExcelComparison(path){
    
    var workbook = new excel.Workbook()
    var worksheet = workbook.addWorksheet('Sheet 1')
    var worksheet2 = workbook.addWorksheet('Sheet 2')

    var style = workbook.createStyle({
        font:{
            size: 10,
        }
    })

    i = 1
    j = 1
    for (let index = 0; index < csv_filtered_data_comp.length; index++) {
        const element = csv_filtered_data_comp[index];
        j = 1
        worksheet.cell(i,j).string(element).style(style)
        i = i+1
    }
    workbook.write(path)

    let options  = {
        type: 'info',
        buttons: ["Close"],
        message: "Success",
        detail: "All data is saved in the File.",
        title: "File Saved",
        cancelId: 0, 
        noLink: false, 
        normalizeAccessKeys: false,
    }
    dialog.showMessageBoxSync(options)
    console.log("Data is saved!")
}

function show_dialog(){
    // for mac
    if(isMac == true){
        let options  = {
            type: 'info',
            buttons: ["Cancel","Start Comparison","Select File 1", "Select File 2"],
            message: "File Comparison Function",
            detail: "Select any two files for comparison and fetching the unique keywords.",
            title: "File Comparison",
            defaultId: 2,
            cancelId: 0, 
            noLink: false, 
            normalizeAccessKeys: false,
        }
        response = dialog.showMessageBoxSync(options)
        if(response == 2){
            fist_file_selection()
        }else if(response == 3){
            second_file_selection()
        }else if(response == 1){
            console.log(first_file_csv_data.length)
            console.log(second_file_csv_data.length)
            if(first_file_csv_data.length <= 0 || second_file_csv_data.length <= 0){
                let options  = {
                    type: 'error',
                    buttons: ["ok"],
                    message: "File Comparison Error",
                    detail: "Please select both files for comparison or the function will not work.",
                    title: "Error",
                    cancelId: 0,
                    noLink: false, 
                    normalizeAccessKeys: false,
                }
                dialog.showMessageBoxSync(options)
                show_dialog()           
            }else{
                start_comparison()
            }
        }
    }else{
        // for linux and windows
        let options  = {
            type: 'info',
            buttons: ["Select File 1","Select File 2","Start Comparison", "Cancel"],
            message: "File Comparison Function",
            detail: "Select any two files for comparison and fetching the unique keywords.",
            title: "File Comparison",
            defaultId: 0,
            cancelId: 3, 
            noLink: false, 
            normalizeAccessKeys: false,
        }
        response = dialog.showMessageBoxSync(options)
        if(response == 0){
            fist_file_selection()
        }else if(response == 1){
            second_file_selection()
        }else if(response == 2){
            console.log(first_file_csv_data.length)
            console.log(second_file_csv_data.length)
            if(first_file_csv_data.length <= 0 || second_file_csv_data.length <= 0){
                let options  = {
                    type: 'error',
                    buttons: ["ok"],
                    message: "File Comparison Error",
                    detail: "Please select both files for comparison or the function will not work.",
                    title: "Error",
                    cancelId: 0,
                    noLink: false, 
                    normalizeAccessKeys: false,
                }
                dialog.showMessageBoxSync(options)
                show_dialog()           
            }else{
                start_comparison()
            }
        }
    }

    
}

document.getElementById('comp-btn').addEventListener('click', function(){
    //Minimum options object
    show_dialog()
})

//////////////////////////////////////////////////////////////////////////
////////
///////                END OF SECOND FUNCTION SECTION
//////
//////////////////////////////////////////////////////////////////////////

document.getElementById('contact-us').addEventListener('click', function(){
    shell.openExternal("https://www.keysyofficial.com/contactus")
})
document.getElementById('privacy-policy').addEventListener('click', function(){
    shell.openExternal("https://www.keysyofficial.com/privacy-policy")
})
document.getElementById('terms-use').addEventListener('click', function(){
    shell.openExternal("https://www.keysyofficial.com/terms-of-service")
})

