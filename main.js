var BitField = require("./bitfield.js");

var HammingBitField = function(n){//n is the number of correction bits
    var blockSize = 1<<n;
    var blockDataSize = blockSize - n - 1;
    this.blockSize = blockSize;
    this.blockDataSize = blockDataSize;
    this.encode = function(field,fieldlen){//encoding the bitfield
        //console.log(fieldlen);
        var len = Math.ceil(fieldlen/blockDataSize);//resulting bit field length
        
        var bits = new BitField(len*blockSize);
        
        var didx = 0;//data index
        var gidx = 0;//global index
        while(didx < fieldlen){
            //bits.clear(gidx); //already 0
            gidx++;
            var parity = 0;
            for(var i = 0; i < n; i++){
                var thisidx = 1<<i;
                //bits.clear(gidx); // already 0
                gidx++;
                var nextidx = 1<<(i+1);
                for(var j = thisidx+1; j < nextidx; j++){
                    //console.log(didx,gidx,field.get(didx));
                    if(field.get(didx) === 1){//1
                        bits.set(gidx);
                        parity ^= j;
                    }else{//0
                        bits.clear(gidx);
                    }
                    didx++;
                    gidx++;
                }
            }
            //console.log(">"+didx);
            //console.log(">"+gidx);
            var parityParity = 0;
            for(var k = 0; k < n; k++){
                var digit = (parity>>k)&1;
                parityParity ^= digit;
                if(digit === 1){//set 1
                    bits.set(gidx-blockSize+(1<<k));
                }else{//set 0
                    bits.clear(gidx-blockSize+(1<<k));
                }
            }
            //finally, the first bit
            if(parityParity === 1){
                bits.set(gidx-blockSize);
            }else{//set 0
                bits.clear(gidx-blockSize);
            }
        }
        return bits;
    };
    
    this.decode = function(bits,bitslen){
        var blocklen = bitslen/blockSize;
        var fieldlen = blocklen*blockDataSize;
        var field = new BitField(fieldlen);
        var fidx = 0;
        //console.log(blocklen);
        for(var ii = 0; ii < blocklen; ii++){
            var parity = 0;
            var bidx = ii*blockSize;
            for(var i = 1; i < blockSize; i++){
                if(bits.get(bidx+i) === 1)parity ^= i;
            }
            bits.invert(bidx+parity);
            
            for(var i = 1; i < n; i++){
                var thisval = 1<<i;
                var nextval = 1<<(i+1);
                for(var j = thisval+1; j < nextval; j++){
                    if(bits.get(bidx+j) === 1){
                        field.set(fidx);
                    }else{
                        field.clear(fidx);
                    }
                    fidx++;
                }
            }
        }
        return field;
    }
}



var Hamming = function(n){//2 to the n  bits of parity
    var blockSize = 1<<n;
    var blockDataSize = blockSize - n - 1;
    this.encode = function(bits){
        var blocks = [];
        var idx = 0;//index of the bit
        
        while(idx < bits.length){
            var block = [0];
            blocks.push(block);
            var cnt = 0;
            for(var k = 0; k < n; k++){
                block[1<<k] = 0;//initializing
            }
            for(var i = 0; i < n; i++){
                var thisval = 1<<i;
                var nextval = 1<<(i+1);
                for(var j = thisval+1; j < nextval; j++){
                    block[j] = bits[idx] || 0;
                    idx++;
                    //nowincrementing the parity bits
                    for(var k = 0; k < n; k++){
                        //xor equal
                        block[1<<k] ^= ((j>>k)&1)&(block[j] || 0);
                    }
                }
            }
            //block filled
        }
        return blocks;
    };
    
    this.decode = function(blocks){
        var data = [];
        for(var ii = 0; ii < blocks.length; ii++){
            var block = blocks[ii];
            
            for(var i = 0; i < n; i++){
                var thisval = 1<<i;
                var nextval = 1<<(i+1);
                for(var j = thisval+1; j < nextval; j++){
                    //now incrementing the parity bits
                    for(var k = 0; k < n; k++){
                        block[1<<k] ^= ((j>>k)&1)&(block[j] || 0);
                        //this should be 0 by the end
                    }
                }
            }
            //tally of parity is the wrong address
            var address = 0;
            for(var k = 0; k < n; k++){
                address += block[1<<k]<<k;
            }
            block[address] = [(block[address]^1)];//flip it and mark it
            
            
            for(var i = 0; i < n; i++){
                var thisval = 1<<i;
                var nextval = 1<<(i+1);
                for(var j = thisval+1; j < nextval; j++){
                    data.push(block[j]);
                }
            }
        }
        return data;
    };
};

var hamming = new Hamming(4);

var data0 = [0,1,1,0,1,0,1,0,0,1,1,0,0,0,0,1,0,0,1,1,0,0,1,0,0,1,1,0,1,0,1,1,1];
/*console.log("original data:    \n"+JSON.stringify(data0));
console.log("encoding");
var coded = hamming.encode(data0);
console.log("blocks:           \n"+JSON.stringify(coded));
var coded111 = [].concat.apply([], coded);
var erridx = 5;
coded[0][erridx] ^= 1;
console.log("introducing error at block 0 bit "+erridx);
//introducing error
console.log("blocks:           \n"+JSON.stringify(coded));
var data1 = hamming.decode(coded);
console.log("corrected result: \n"+JSON.stringify(data1));
console.log("corrected bit has been marked by []");*/


var colorBits = function(bits){
    var bl = bits.length/16;
    for(var ii = 0; ii < bl; ii++){
        bits[ii*16] = "\u001b[32m"+bits[ii*16]+"\u001b[0m";
        for(var i = 0; i < 4; i++){
            var thisval = 1<<i;
            var nextval = 1<<(i+1);
            bits[ii*16+thisval] = "\u001b[34m"+bits[ii*16+thisval]+"\u001b[0m";
        }
    }
    return bits;
};



console.log("\nnow using bitfield\n");
var data00 = new BitField(data0.length);
for(var i = 0; i < data0.length; i++){
    if(data0[i] === 1){
        data00.set(i);
    }else{
        data00.clear(i);
    }
}
data00.setRandomBits();

console.log("original data:");
console.log(JSON.stringify(data00.getBitList()));
var hammingbits = new HammingBitField(4);
console.log("encoding");
var coded = hammingbits.encode(data00,data0.length);
console.log("\u001b[32mgreen bits\u001b[0m mark the start of a chunk, and \u001b[34mblue bits\u001b[0m maek the parity bits");
console.log("now introducing error at 5, 20, and 42nd index");
console.log("correct:   ["+colorBits(coded.getBitList()).join(",")+"]");
//console.log(colorBits(coded111));
coded.invert(5);
coded.invert(20);
coded.invert(42);
var markedBitList = colorBits(coded.getBitList());
markedBitList[5] = "\u001b[41;1m"+markedBitList[5]+"\u001b[0m";
markedBitList[20] = "\u001b[41;1m"+markedBitList[20]+"\u001b[0m";
markedBitList[42] = "\u001b[41;1m"+markedBitList[42]+"\u001b[0m";
console.log("error:     ["+markedBitList.join(",")+"]");
var data1 = hammingbits.decode(coded,Math.ceil(data0.length/hammingbits.blockDataSize)*hammingbits.blockSize);
console.log("corrected: ["+colorBits(coded.getBitList()).join(",")+"]");
console.log("");
console.log("result:   "+JSON.stringify(data1.getBitList()));
console.log("original: "+JSON.stringify(data00.getBitList()));


