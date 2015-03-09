var $ = function(id) { return typeof id == 'string' ? document.getElementById(id) : id; }

var RMB = {};
RMB.Zheng = "整";
RMB.RMBDigits = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
RMB.Units = new Array("分", "角", "圆", "拾", "佰", "仟", "万", "拾万", "佰万", "仟万", "亿", "拾亿", "佰亿", "仟亿", "万亿", "拾万亿", "佰万亿", "仟万亿");

/*
Summary:    Replace each arab digit with RMB digit, regardless of positive or not.         
input:      '-10011001100.11'
output:     '壹零零壹壹零零壹壹零零壹壹'
*/
RMB.GetChnString = function(ArabString) {
    if (typeof ArabString == 'undefined')
        return '';

    if (typeof ArabString == 'number' && !isNaN(ArabString))
        ArabString = ArabString + '';

    var pointPos = ArabString.indexOf('.');
    if (pointPos == -1)
        ArabString += '.00';
    else if (pointPos == ArabString.length - 1)
        ArabString += '00';
    else if (pointPos == ArabString.length - 2)
        ArabString += '0';
    else if (pointPos <= ArabString.length - 3)
        ArabString = ArabString.slice(0, pointPos + 3);

    var ret = '';
    for (var i = 0; i < ArabString.length; i++) {
        var c = ArabString.charAt(i);
        if (c == '-' || c == '.')
            continue;

        ret += this.RMBDigits[parseInt(c)];
    }

    return ret;
};

RMB.IsChnZero = function(digit) {
    return digit == this.RMBDigits[0];
};

/*
Summary:    Translate each (no more than)four RMBDigits string to the natural expression.
input:      '玖玖玖玖'
output:     '玖仟玖佰玖十玖'
*/
RMB.BasicTranslate = function(piece) {
    if (typeof piece != 'string' || !piece || 4 < piece.length)
        return '';

    var len = piece.length;

    //玖仟玖佰玖十[玖]
    var ret = piece.charAt(len - 1);

    //玖仟玖佰[玖十]玖
    if (1 < len)
        ret = this.IsChnZero(piece.charAt(len - 2)) ? piece.charAt(len - 2) + ret : piece.charAt(len - 2) + '拾' + ret;

    //玖仟[玖佰]玖十玖
    if (2 < len)
        ret = this.IsChnZero(piece.charAt(len - 3)) ? piece.charAt(len - 3) + ret : piece.charAt(len - 3) + '佰' + ret;

    //[玖仟]玖佰玖十玖
    if (3 < len)
        ret = this.IsChnZero(piece.charAt(len - 4)) ? piece.charAt(len - 4) + ret : piece.charAt(len - 4) + '仟' + ret;

    return ret;
};

/*
Summary:    Translate decimal part.
input:      '玖'
output:     '玖角整'
*/
RMB.DecimalTranslate = function(decimalPart) {
    if (typeof decimalPart != 'string' || !decimalPart || 2 != decimalPart.length)
        return '';

    var zeroFen = this.IsChnZero(decimalPart.charAt(1));
    var zeroJiao = this.IsChnZero(decimalPart.charAt(0));

    if (zeroJiao) {
        return zeroFen ? this.Zheng : decimalPart + '分';
    }
    else {
        if (zeroFen)
            return decimalPart.charAt(0) + '角' + this.Zheng;
        else
            return decimalPart.charAt(0) + '角' + decimalPart.charAt(1) + '分';
    }
};

RMB.Translate = function(money) {
    if (typeof money != 'string')
        return '不能识别的金额';

    var amount = parseFloat(money);
    if (isNaN(amount))
        return '不能识别的金额';

    var chn = this.GetChnString(amount);
    if (chn.length > 18)
        return '数额过大(大于 \'玖仟万\'), 无法处理.';

    var decimalPart = chn.slice(chn.length - 2);
    var output = this.DecimalTranslate(decimalPart);

    for (var i = chn.length - 2; i > 0; i -= 4) {
        var digitsPiece = i < 4 ? chn.slice(0, i) : chn.slice(i - 4, i);
        var chnPiece = this.BasicTranslate(digitsPiece);
        var unit = this.Units[chn.length - i];
        output = chnPiece + unit + output;
    }

    //remove redundant zeros.
    output = output.replace(/零+/g, '零');
    
    //replace '零亿','零万'...etc with unit only.
    output = output.replace(/零([圆万亿]|万亿)/g, '$1');
    return output;
};

//Below are the implementation of the others.
function cmycurd(num)  //转成人民币大写金额形式
{
    var str1 = '零壹贰叁肆伍陆柒捌玖';          //0-9所对应的汉字
    var str2 = '万仟佰拾亿仟佰拾万仟佰拾元角分'; //数字位所对应的汉字
    var str3;                                 //从原num值中取出的值
    var str4;                                 //数字的字符串形式
    var str5 = '';                            //人民币大写金额形式
    var i;                                    //循环变量
    var j;                                    //num的值乘以100的字符串长度
    var ch1;                                  //数字的汉语读法
    var ch2;                                  //数字位的汉字读法
    var nzero = 0;                            //用来计算连续的零值是几个

    num = Math.abs(num).toFixed(2);           //将num取绝对值并四舍五入取2位小数
    str4 = (num * 100).toFixed(0).toString(); //将num乘100并转换成字符串形式
    j = str4.length;                          //找出最高位
    if (j > 15) return '溢出';
    str2 = str2.substr(15-j);                 //取出对应位数的str2的值。如：200.55,j为5所以str2=佰拾元角分
  
    //循环取出每一位需要转换的值
    for(i=0;i<j;i++)
    {
        str3 = str4.substr(i,1);   //取出需转换的某一位的值
        if (i != (j-3) && i != (j-7) && i != (j-11) && i != (j-15)) //当所取位数不为元、万、亿、万亿上的数字时
        {    
            if (str3 == '0')
            {
                ch1 = '';
                ch2 = '';
                nzero = nzero + 1;
            }
            else
            {
                if(str3 != '0' && nzero != 0)
                {
                    ch1 = '零' + str1.substr(str3*1,1);
                    ch2 = str2.substr(i,1);
                    nzero = 0;
                }
                else
                {
                    ch1 = str1.substr(str3*1,1);
                    ch2 = str2.substr(i,1);
                    nzero = 0;
                }
            }
        }
        else //该位是万亿，亿，万，元位等关键位
        { 
            if (str3 != '0' && nzero != 0)
            {
                ch1 = "零" + str1.substr(str3*1,1);
                ch2 = str2.substr(i,1);
                nzero = 0;
            }
            else
            {
                if (str3 != '0' && nzero == 0)
                {
                    ch1 = str1.substr(str3*1,1);
                    ch2 = str2.substr(i,1);
                    nzero = 0;
                }
                else
                {
                    if (str3 == '0' && nzero >= 3)
                    {
                        ch1 = '';
                        ch2 = '';
                        nzero = nzero + 1;
                    }
                    else
                    {
                        if (j >= 11)
                        {
                              ch1 = '';
                              nzero = nzero + 1;
                        }
                        else
                        {
                            ch1 = '';
                            ch2 = str2.substr(i,1);
                            nzero = nzero + 1;
                        }
                    }
                }
            }
        }
        
        if (i == (j-11) || i == (j-3))  //如果该位是亿位或元位，则必须写上
            ch2 = str2.substr(i,1);
    
        str5 = str5 + ch1 + ch2;
    
        if (i == j-1 && str3 == '0' )   //最后一位（分）为0时，加上“整”
            str5 = str5 + '整';
    } //end of for
    
    if (num == 0)
        str5 = '零元整';
    
    return str5;
}