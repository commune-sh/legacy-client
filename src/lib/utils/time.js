export function formatThreadTime(t) {
    let now = new Date()
    let postedOn = new Date(t);

    let ampm= postedOn.getHours() >= 12 ? `PM` : `AM`

    let fhour = hours12(postedOn)


    let fmin = postedOn.getMinutes()

    if(fmin < 10) {
        fmin = `0${fmin}`
    }

    let formatted = `${fhour}:${fmin} ${ampm}`

    let diff = now.getDate() - postedOn.getDate()

    if(diff > 1) {
    }

    if(postedOn.getDate() == now.getDate()) {
        return formatted
    }

    if(diff == 1 || diff == -30 || diff == -29) {
        return formatted
    }

    formatted = `${postedOn.getDate()}/${postedOn.getMonth()}/${postedOn.getFullYear()}`

    return formatted
}

export function threadTimeAgo(age) {
    let now = new Date()
    let postedOn = new Date(age);


    if(postedOn.getDate() == now.getDate()) {
        return `Today at`
    }

    let diff = now.getDate() - postedOn.getDate() 
    if(diff == 1 || diff == -30 || diff == -29) {
        return `Yesterday at`
    }

    return ``
}

function hours12(date) { return (date.getHours() + 24) % 12 || 12; }

export function timeAgo(age) {
    let now = new Date()
    let y = new Date() - age
    let postedOn = new Date(y);


    if(postedOn.getDate() == now.getDate()) {
        return `Today at`
    }

    let diff = now.getDate() - postedOn.getDate() 
    if(diff == 1 || diff == -30 || diff == -29) {
        return `Yesterday at`
    }

    return ``
}

export function formatTime(t) {
    let now = new Date()
    let y = new Date() - t
    let postedOn = new Date(y);

    let ampm= postedOn.getHours() >= 12 ? `PM` : `AM`

    let fhour = hours12(postedOn)


    let fmin = postedOn.getMinutes()

    if(fmin < 10) {
        fmin = `0${fmin}`
    }

    let formatted = `${fhour}:${fmin} ${ampm}`

    let diff = now.getDate() - postedOn.getDate()

    if(diff > 1) {
    }

    if(postedOn.getDate() == now.getDate()) {
        return formatted
    }

    if(diff == 1 || diff == -30 || diff == -29) {
        return formatted
    }

    formatted = `${postedOn.getDate()}/${postedOn.getMonth()}/${postedOn.getFullYear()}`

    return formatted
}


export function timeofDay(t) {
    let now = new Date()
    let y = new Date() - t
    let postedOn = new Date(y);

    let ampm= postedOn.getHours() >= 12 ? `PM` : `AM`

    let fhour = hours12(postedOn)


    let fmin = postedOn.getMinutes()

    if(fmin < 10) {
        fmin = `0${fmin}`
    }

    let formatted = `${fhour}:${fmin} ${ampm}`

    return formatted
}


export function formatTimeAgo(t) {
    let now = new Date()
    let y = new Date() - t
    let postedOn = new Date(y);



  if(t < 86400000) {
    let hours = t / 3600000
    hours = Math.round(hours)
    return `${hours}h`
  }


    const month = postedOn.toLocaleString('default', { month: 'short' });

    let formatted = `${month} ${postedOn.getDate()}`
    return formatted

    let ampm= postedOn.getHours() >= 12 ? `PM` : `AM`

    let fhour = hours12(postedOn)


    let fmin = postedOn.getMinutes()

    if(fmin < 10) {
        fmin = `0${fmin}`
    }

    formatted = `${fhour}:${fmin} ${ampm}`

    let diff = now.getDate() - postedOn.getDate()

    if(diff > 1) {
    }

    if(postedOn.getDate() == now.getDate()) {
        return formatted
    }

    if(diff == 1 || diff == -30 || diff == -29) {
        return formatted
    }

    formatted = `${postedOn.getDate()}/${postedOn.getMonth()}/${postedOn.getFullYear()}`

    return formatted
}


