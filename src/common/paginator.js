
    const SortAndPaginator =async (req, callback, model, filterObject) =>{
        if(!model) {
            callback(new Error('No model found'));
        }

        const page = req.query ? parseInt(req.query.page || 1) : 1;
        const limit = req.query ? parseInt(req.query.limit || 10) :10;
        const skipIndex = (page - 1) * limit;
        const sortBy = req.query ? (req.query.sortBy || "_id") : "_id";
        const sortOrder = req.query.sortOrder === 'desc' ?  -1 : 1;
		let q ="";
		// if (req.query.q) {q = req.query.q}
        const sortObject = {};
        const results = {
            page: page,
            limit: limit 
        };
        sortObject[sortBy] = sortOrder;	
		let totalCount = await model.find(filterObject).countDocuments();
		let result =await model.aggregate([{$match:filterObject}])
            .sort(sortObject)
			.skip(skipIndex)
            .limit(limit)
            .exec();	
        try {
            const [count, list] = await Promise.all([totalCount, result]);
            results.totalCount = count;
            results.list = list;
            return results
        } catch(e) {
            callback(e);
        }
    }


module.exports = {SortAndPaginator}