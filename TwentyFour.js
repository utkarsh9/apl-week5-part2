var fs = require('fs');

class TFQuarantine{
    constructor(func){
        this.functions=[func];
    }
	
	bind(func) {
        this.functions.push(func);
        return this;
	}
	
	execute(){
		var guardCallable = (f) => {
            if (f instanceof Function){
                return f();
            }
            else{
                return f;
            }
        };
        var value; 
        for(var func in this.functions){
            value=this.functions[func](guardCallable(value));
        }
       guardCallable(value);
    }
}

var getInput = () => {
    return () => {
        return process.argv[2];
    };
};

var extractWords = (filePath) => {
    return () => {
        var data = fs.readFileSync(filePath, 'utf8');
        var dirtyArray=data.split(/[\W_]+/g);
        data=dirtyArray.map(str=>{
            return str.toLowerCase();
        });
        return data;
    }; 
};

var removeStopWords = (words) => {return () => {
    var data=[];
    var contents=fs.readFileSync("stop-words.txt", 'utf8');
    var dirtyArray=contents.split(",");
    var stopWordsData=dirtyArray.map(str=>{
        return str.toLowerCase();
    });
    for(i=0;i<words.length;i++){
        if(!stopWordsData.includes(words[i]) && "s".localeCompare(words[i])){
            data.push(words[i]);
        } 
    }
    return data;
    };
    
};

function frequencies(wordList){
    var wordMap={};
    for(i=0;i<wordList.length;i++){
        if(wordMap.hasOwnProperty(wordList[i])){
            wordMap[wordList[i]]+=1;
        }else{
            wordMap[wordList[i]]=1;
        }
    }
    return wordMap;
}

function sort(wordFrequencies){
     var wordCountArray=[];
     wordCountArray=Object.keys(wordFrequencies).map(function(key){
        return{
            word:key,
            total:wordFrequencies[key]
        };
     });
     wordCountArray.sort(function(a,b){
        return b.total-a.total;
     });
    return wordCountArray;
}

function top25Frequencies(wordCountArray){
    for(j=0;j<25;j++){
        console.log(wordCountArray[j].word+"-"+wordCountArray[j].total);
    }
}

new TFQuarantine(getInput).bind(extractWords)
.bind(removeStopWords)
.bind(frequencies)
.bind(sort)
.bind(top25Frequencies)
.execute();