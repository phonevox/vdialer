#!/usr/bin/node
// Função para construir a query de pesquisa MongoDB estilo LIKE-like
function buildSearchQuery(queryParams) {
    let searchQuery = {};
    let DONT_REGEX_THESE = ['_id'];

    for (const key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
            if (DONT_REGEX_THESE.includes(key) || !isNaN(queryParams[key])) {
                // essas keys nao podem usar regex
                searchQuery[key] = queryParams[key];
            } else if (typeof queryParams[key] === 'string') {
                // se for uma string, faço regex
                searchQuery[key] = { $regex: queryParams[key], $options: 'i' }; // $options: 'i' é para case insensitive
            } else {
                // em teoria nunca vai cair aqui
                searchQuery[key] = queryParams[key];
            }
        }
    }

    return searchQuery;
}

module.exports = {
    buildSearchQuery
}
