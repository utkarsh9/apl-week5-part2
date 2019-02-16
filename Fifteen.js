var fs=require('fs');

class EventManager{
    constructor(){
        this.subscriptions={};
    }

    subscribe(eventType,handler){
      this.subscriptions[eventType]=handler;
    }

    publish(event){
        var eventType=event[0];
        if(eventType in this.subscriptions){
            this.subscriptions[eventType](event[1]);
        }
    }
}

class DataStorage{
    constructor(ps){
        this.pubsubObj=ps;
        this.data=[];
        this.pubsubObj.subscribe("bookload",this.load);
        this.pubsubObj.subscribe("start",this.produceWords);
    }

    load(event){
        var filePath=event;
        var contents=fs.readFileSync(filePath, 'utf8');
        ds.data = contents.replace(/[\W_]+/g, ' ').toLowerCase().split(' ');
    }

    produceWords(event){
        var i;
        for(i=0;i<ds.data.length;i++){
            ds.pubsubObj.publish(["word",ds.data[i]]);
        }
        ds.pubsubObj.publish(["eof"]);
    }

}

class StopWordFilter{
    constructor(ps){
        this.pubsubObj=ps;
        this.stopWords=[];
        this.pubsubObj.subscribe("stopload",this.load);
        this.pubsubObj.subscribe("word",this.isStopWord);
    }

    load(event){
        var contents=fs.readFileSync(event, 'utf8');
        var dirtyArray=contents.split(",");
        swf.stopWords=dirtyArray.map(str=>{
            return str.toLowerCase();
        });
    }

    isStopWord(event){
        var word=event;
        if(!swf.stopWords.includes(word) && "s".localeCompare(word)){
            wfc.pubsubObj.publish(["validWord",word]);
        } 
    }
}

class WordFrequencyCounter{
    constructor(ps){
        this.pubsubObj=ps;
        this.wordMap={};
        this.pubsubObj.subscribe("validWord",this.incrementCount);
        this.pubsubObj.subscribe("print",this.printFrequencies);
    }

    incrementCount(event){
        var word=event;
        if(wfc.wordMap.hasOwnProperty(word)){
            wfc.wordMap[word]+=1;
        }else{
            wfc.wordMap[word]=1;
        }
    }

    printFrequencies(){
        var wordCountArray=[];
        var wordFrequencies=wfc.wordMap;
        var j;
        wordCountArray=Object.keys(wordFrequencies).map(function(key){
            return{
                word:key,
                total:wordFrequencies[key]
            };
        });
        wordCountArray.sort(function(a,b){
            return b.total-a.total;
        });
        for(j=0;j<25;j++){
            console.log(wordCountArray[j].word+"-"+wordCountArray[j].total);
        }
    }
}

class WordFrequencyApplication{
    constructor(ps){
        this.pubsubObj=ps;
        this.pubsubObj.subscribe("run",this.run);
        this.pubsubObj.subscribe("eof",this.stop);
    }

    run(event){
        var filePath=event;
        ds.pubsubObj.publish(["bookload",filePath]);
        swf.pubsubObj.publish(["stopload","stop-words.txt"]);
        ds.pubsubObj.publish(["start"]);
    }

    stop(event){
        wfc.pubsubObj.publish(["print"]);
    }
}

var em=new EventManager;
var ds=new DataStorage(em);
var swf=new StopWordFilter(em);
var wfc=new WordFrequencyCounter(em);
new WordFrequencyApplication(em);
em.publish(["run",process.argv[2]]);
var frequencies=wfc.wordMap;
var count=0;
for (var value of Object.keys(frequencies)) {
    if(!swf.stopWords.includes(value)&& value.includes('z')){
        count++;
    }
}
console.log("Number of words with letter Z  " + count);