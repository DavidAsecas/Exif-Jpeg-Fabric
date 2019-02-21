const shim = require('fabric-shim');
const util = require('util');
const decoder = require('string_decoder');

const Chaincode = class {

    async Init(stub) {
        return shim.success(Buffer.from('Initialized Successfully!'));
    }

    async Invoke(stub) {
        console.info('Transaction ID: ' + stub.getTxID());
        console.info(util.format('Args: %j', stub.getArgs()));

        let ret = stub.getFunctionAndParameters();
        let params = ret.params;
        let fn = ret.fcn;
        // use the invoke input arguments to decide intended changes
        console.info('Calling function: ' + fn);

        if (fn === 'NewTransaction') {
            console.log(fn);
            let result = await this.NewTransaction(stub, params);
            if (result)
                console.info(result);
            return shim.success(Buffer.from('Success!'))
        } else if (fn === 'GetImageHistory') {
            let result = await this.GetImageHistory(stub, params);
            console.log(result);
            if (result)
                return shim.success(Buffer.from(result.toString()));
        }
        return shim.error('No function called!')
    }

    async NewTransaction(stub, args) {
        console.info(args);
        let stringTransaction = args[0];
        let transaction = JSON.parse(stringTransaction);
        let idImagen = transaction.idImagen;
        stringTransaction = JSON.stringify(transaction);
        console.log(stringTransaction);
        try {
            return await stub.putState(idImagen, Buffer.from(stringTransaction));
        } catch (e) {
            return shim.error(e);
        }
    }

    async GetImageHistory(stub, args) {
        let idImagen = args[0];
        try {
            let iterator = await stub.getHistoryForKey(idImagen);
            let history = [];
            let done = false
            while (!done) {
                let item = await iterator.next();
                let buffer = item.value.value.toString('utf8');
                console.log(buffer)
                // let stringTransaction = Buffer.from(buffer).toString();
                // let transaction = JSON.parse(stringTransaction);
                history.push(buffer);
                if (item.done == true)
                    done = true;
            }
            return history;
        } catch (e) {
            return shim.error(e);
        }
    }
};

shim.start(new Chaincode());