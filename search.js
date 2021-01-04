const fs = require('fs')
const yargs = require('yargs')
const express = require('express')
var permutation = require('array-permutation');
const app = express();
const path = require('path');

app.set('view engine','hbs')

app.use(express.static(path.join(__dirname,"../public")))

yargs.version("1.1.0");

const port=3000

const loadUrls = ()=>{
    try {
        urls = fs.readFileSync("list.json")
        list = urls.toString()
        return JSON.parse(list)
    } catch (e) {
        return [];
    }
}

const saveList = (list)=>{
        const list2 = JSON.stringify(list)
        fs.writeFileSync("list.json",list2)
}

// const saveCache = (cache)=>{
//     const cacheObject = {cacheArray: cache}
//     console.log(cacheObject)
//     // const stringObject = JSON.stringify(cacheObject)
//     // console.log(stringObject)
//     fs.writeFileSync("cache.json",cacheObject)
// }

const addUrl = (name,tagslist)=>{
    const list = loadUrls()
    tags = tagslist.split(",")
    for(i=0;i<tags.length;i++){
        tags[i] = tags[i].toLowerCase()
    }
    const duplicateUrl = list.filter((item) => item.name === name)
    if(duplicateUrl.length==0){
        list.push({
            name: name,
            tags: tags
        })
        saveList(list)
        console.log("List Updated!")
    } else {
        const n = duplicateUrl[0].tags
        for(i=0;i<tags.length;i++) {
            duplicateTag = duplicateUrl[0].tags.filter((tag)=> tag === tags[i])
            if(duplicateTag.length==0) {
                duplicateUrl[0].tags.push(tags[i])
            }
        }
        if(n!==duplicateUrl[0].tags.length) {
            var newList = list.filter((item) => item.name !== duplicateUrl[0].name)
            newList.push(duplicateUrl[0])
            saveList(newList)
            console.log("List Updated!")
        }
    }
}

var allTags =[]

const findAllTags = ()=>{
    list = loadUrls()
    for(i=0;i<list.length;i++){
        for(j=0;j<list[i].tags.length;j++){
            t=0
            for(k=0;k<allTags.length;k++){
                if(list[i].tags[j]===allTags[k]){
                    t=1;
                }
            }
            if(t==0){
                allTags.push(list[i].tags[j])
            }
        }
    }
}

var cache = []

const searchUrl = (tagsList)=>{
    const tags2 = tagsList.split(" ")
    for(i=0;i<tags2.length;i++){
        tags2[i] = tags2[i].toLowerCase()
    }
    var tags = []
    for(i=0;i<tags2.length;i++){
        for(j=0;j<allTags.length;j++){
            if(tags2[i]===allTags[j]){
                l=0
                for(k=0;k<tags.length;k++){
                    if(tags[k]===allTags[j]){
                        l++;
                    }
                }
                if(l==0){
                    tags.push(tags2[i])
                }
            }
        }
    }
    if(tags.length===1){
        if(cache[tags]){
            console.log("Found this in cache!")
            return cache[tags];
        }
    }
    var urls = []
    const list = loadUrls()
    var pm = permutation(tags)
    var possibilities = []
    for(var p of pm){
        if (cache[p]){
            for(i=0;i<cache[p].length;i++){
                outcomeExists = possibilities.filter((item) => item === cache[p][i])
                if(outcomeExists.length===0){
                    possibilities.push(cache[p][i])
                }
            }
        }
    }
    if(possibilities.length!==0){
        console.log("Found this in cache!")
        return possibilities;
    }
    var urlTag=[]
    for(i=0;i<list.length;i++){
        for(j=0;j<list[i].tags.length;j++){
            for(k=0;k<tags.length;k++){
                if(list[i].tags[j].toLowerCase() === tags[k]){
                    urlTag.push(list[i].tags[j])
                    console.log(urlTag)
                    var urlpresent = urls.find((url)=> url.url === list[i].name)
                    if(!urlpresent){
                        urls.push({url: list[i].name, score: 0})
                    } else {
                        urlpresent.score++
                        const newList = urls.filter((url) => url.url !== urlpresent.url)
                        newList.push(urlpresent)
                        urls = newList
                    }
                }
            }
            if(urlTag.length!==0){
                if(cache[urlTag]===undefined){
                    cache[urlTag]=[]
                }
                item = cache[urlTag].find((item)=> item === list[i].name)
                if(!item){
                cache[urlTag].push(list[i].name)
                }
                // var pm = permutation(urlTag)
                // for(var p of pm){
                //     cache[p]=cache[urlTag]
                // }
            }
        }
        urlTag=[]
    }
    if(urls.length==0){
        return "Not Found"
    }
    var sortarr = []
    for(i=0;i<tags.length;i++){
        sortarr[i]=[]
    }
    for(i=0;i<urls.length;i++){
        sortarr[urls[i].score].push(urls[i].url)
    }
    var finalList = []
    for(j=sortarr.length-1;j>-1;j--){
        for(i=0;i<sortarr[j].length;i++){
            finalList.push(sortarr[j][i])
        }
    }
    cache[tags] = []
    for(i=0;i<finalList.length;i++){
        itemExists = cache[tags].filter((item)=> item == finalList[i])
        if(itemExists.length==0){
            cache[tags].push(finalList[i])
        }
    }
    // var pm = permutation(tags)
    // for(var p of pm){
    //     cache[p]=cache[tags]
    // }
    console.log(cache)
    // saveCache(cache)
    return finalList;
}

const removeUrlTags = (name,tagslist)=>{
    if(tagslist.length==0){
        console.log("You must specify at least one tag to be removed!")
    } else {
        const tags = tagslist.split(",")
        const list = loadUrls();
        const oldUrl = list.find((item) => item.name === name)
        if(oldUrl){
            const n = oldUrl.tags.length
            for(i=0;i<tags.length;i++){
                oldUrl.tags = oldUrl.tags.filter((tag)=> tag !== tags[i])
            }
            if(n!==oldUrl.tags.length){
                var newList = list.filter((item) => item.name !== oldUrl.name)
                newList.push(oldUrl)
                saveList(newList)
                console.log("List Updated!")                
            }
        } 
        else {
            console.log("URL does not exist!")
        } 
    }
}

const removeUrls = (namesList)=>{
    var list = loadUrls();
    const names = namesList.split(",")
    for(i=0;i<names.length;i++){
        list = list.filter((item) => item.name !== names[i])
    }
    saveList(list)
}

const enlistDocs = ()=>{
    const list = loadUrls();
    console.log(list);
}

yargs.command({
    command: 'add',
    describe: 'add a url',
    builder: {
        name: {
            describe: "name",
            type: "String",
            demandOption: true
        },
        tagsList: {
            describe: "tags list",
            type: "String",
            demandOption: true
        }
    },
    handler(argv){
        addUrl(argv.name,argv.tagsList)
    }
})

yargs.command({
    command: 'removeTags',
    describe: 'remove tags',
    builder: {
        name: {
            describe: "name",
            type: "String",
            demandOption: true
        },
        tagslist: {
            describe: "tags list",
            type: "String",
            demandOption: true
        }
    },
    handler(argv){
        removeUrlTags(argv.name,argv.tagslist)
    }
})

yargs.command({
    command: 'removeUrls',
    describe: 'remove url',
    builder: {
        names: {
            describe: "names list",
            type: "String",
            demandOption: true
        }
    },
    handler(argv){
        removeUrls(argv.names)
    }
})

yargs.command({
    command: 'search',
    describe: 'search urls',
    builder: {
        tagsList: {
            describe: "tags list",
            type: "String",
            demandOption: true
        }
    },
    handler(argv){
        searchUrl(argv.tagsList)
    }
})

yargs.command({
    command: 'list',
    describe: 'Enlist all documents',
    handler(argv){
        enlistDocs();
    }
})

yargs.parse()

app.get("/",(req,res)=>{
    res.render("index.hbs");
})

app.get("/enlist",(req,res)=>{
    const results = searchUrl(req.query.tags)
    res.send({urlList: JSON.stringify(results)})
})

app.listen(port,()=>{
    findAllTags()
    console.log("Started Listening at Port:" + port)
})
