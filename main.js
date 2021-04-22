

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
            var parities = [];
            
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
        }
        
        for(var i = 0; i < n; i++){
            var thisval = 1<<i;
            var nextval = 1<<(i+1);
            for(var j = thisval+1; j < nextval; j++){
                data.push(block[j]);
            }
        }
        return data;
    };
};

var hamming = new Hamming(4);

var data0 = [0,1,1,0,1,0,1,0,0,1,1];
console.log("original data:    "+JSON.stringify(data0));
console.log("encoding");
var coded = hamming.encode(data0);
var erridx = 5;
coded[0][erridx] ^= 1;
console.log("introducing error at block 0 bit "+erridx);
//introducing error
console.log("blocks:           "+JSON.stringify(coded));
var data1 = hamming.decode(coded);
console.log("corrected result: "+JSON.stringify(data1));
console.log("corrected bit has been marked by []");