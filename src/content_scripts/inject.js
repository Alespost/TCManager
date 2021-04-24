function inject(code, parent = document.documentElement)
{
  const script = document.createElement('script');

  script.async = false;
  script.text = code;

  parent.insertBefore(script, parent.firstChild);
  parent.removeChild(script);
}