/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

/**
 * Execute given script in the page's JavaScript context.
 *
 * This function is a modified version of the similar function from
 * Privacy Badger <https://www.eff.org/privacybadger>
 * https://github.com/EFForg/privacybadger/blob/master/src/js/utils.js
 * Copyright (C) 2014 Electronic Frontier Foundation
 *
 * Derived from Adblock Plus
 * Copyright (C) 2006-2013 Eyeo GmbH
 *
 * Privacy Badger is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 */
function inject(code, parent = document.documentElement)
{
  const script = document.createElement('script');

  script.async = false;
  script.text = code;

  parent.insertBefore(script, parent.firstChild);
  parent.removeChild(script);
}