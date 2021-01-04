const queryForm = document.querySelector("form")
const search = document.querySelector("input")

queryForm.addEventListener("submit",(event)=>{
    event.preventDefault()
    const url = "/enlist?" + search.value;
    console.log(url)
    fetch(url)
})