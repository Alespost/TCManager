/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

function inject(code, parent = document.documentElement)
{
  const script = document.createElement('script');

  script.async = false;
  script.text = code;

  parent.insertBefore(script, parent.firstChild);
  parent.removeChild(script);
}